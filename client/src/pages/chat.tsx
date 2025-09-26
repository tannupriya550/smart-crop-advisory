import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { FarmProfile } from '@shared/schema';
import { voiceService } from '@/lib/voice-service';
import { Send, Mic, MicOff, Paperclip, Bot, User, Loader2, Volume2, VolumeX } from 'lucide-react';

interface LocalChatMessage {
  id: string;
  message: string;
  response: string;
  createdAt: Date;
  language: string;
}

export default function Chat() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [farmProfile] = useLocalStorage<Partial<FarmProfile> | null>('farm-profile', null);
  const [chatHistory, setChatHistory] = useLocalStorage<LocalChatMessage[]>('chat-history', []);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [synthesisSupported, setSynthesisSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Check voice support on component mount
  useEffect(() => {
    const compatibility = voiceService.getCompatibilityInfo();
    setRecognitionSupported(compatibility.speechRecognition);
    setSynthesisSupported(compatibility.speechSynthesis);
  }, []);

  const sendMessageToAI = async (messageText: string): Promise<string> => {
    if (!farmProfile) {
      throw new Error('Please create a farm profile first');
    }

    // Create context from farm profile
    const systemPrompt = `You are an experienced agricultural advisor helping small farmers in India. 
      Respond in ${language === 'hi' ? 'Hindi' : language === 'en' ? 'English' : language}. 
      Provide practical, actionable advice for farming. Keep responses concise and farmer-friendly.
      
      Farmer context:
      - Location: ${farmProfile.location}
      - Farm size: ${farmProfile.farmSize} acres
      - Soil type: ${farmProfile.soilType}
      - Irrigation: ${farmProfile.irrigation}
      - Previous crops: ${farmProfile.previousCrops?.join(', ') || 'None'}`;

    // For demo purposes, simulate AI response with relevant farming advice
    const responses = {
      'hi': [
        'आपकी मिट्टी और खेत के आधार पर, मैं सुझाव देता हूं कि आप सोयाबीन या मक्का की खेती करें। ये फसलें आपकी मिट्टी के लिए उपयुक्त हैं।',
        'खरीफ सीजन के लिए, आपको नाइट्रोजन 40-60 किग्रा प्रति एकड़ और फॉस्फोरस 30-40 किग्रा प्रति एकड़ का उपयोग करना चाहिए।',
        'कीट नियंत्रण के लिए नीम आधारित कीटनाशक का उपयोग करें। यह प्राकृतिक और सुरक्षित है।',
      ],
      'en': [
        `Based on your ${farmProfile.soilType} soil and ${farmProfile.farmSize} acres, I recommend soybean or maize for the current season. These crops suit your soil type well.`,
        `For fertilizer, apply 40-60 kg Nitrogen and 30-40 kg Phosphorus per acre. Split the application - half at sowing and half 30 days after sowing.`,
        `For pest control, use neem-based pesticides. Monitor your fields regularly for early detection of pests and diseases.`,
      ]
    };

    const availableResponses = responses[language as keyof typeof responses] || responses.en;
    const randomResponse = availableResponses[Math.floor(Math.random() * availableResponses.length)];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return randomResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    if (!farmProfile) {
      toast({
        title: "Error",
        description: "Please create a farm profile first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const userMessage = message.trim();
    setMessage('');

    try {
      const aiResponse = await sendMessageToAI(userMessage);
      
      const newChatMessage: LocalChatMessage = {
        id: crypto.randomUUID(),
        message: userMessage,
        response: aiResponse,
        createdAt: new Date(),
        language: language
      };

      setChatHistory([...chatHistory, newChatMessage]);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleVoiceInput = async () => {
    if (!recognitionSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      voiceService.stopListening();
      setIsRecording(false);
      return;
    }

    // Start recording
    try {
      setIsRecording(true);
      
      await voiceService.startListening(
        (result) => {
          // Update message with interim results
          if (result.isFinal) {
            setMessage(result.transcript);
            setIsRecording(false);
          } else {
            // Show interim results in input
            setMessage(result.transcript);
          }
        },
        (error) => {
          setIsRecording(false);
          toast({
            title: "Voice Recognition Error",
            description: error,
            variant: "destructive"
          });
        },
        () => {
          setIsRecording(false);
        },
        {
          language: language,
          continuous: false,
          interimResults: true
        }
      );
    } catch (error) {
      setIsRecording(false);
      toast({
        title: "Voice Recognition Failed",
        description: "Could not start voice recognition",
        variant: "destructive"
      });
    }
  };

  const handleSpeakMessage = async (text: string) => {
    if (!synthesisSupported) return;

    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await voiceService.speak(text, language, {
        rate: 0.9,
        pitch: 1,
        volume: 0.8
      });
      setIsSpeaking(false);
    } catch (error) {
      setIsSpeaking(false);
      toast({
        title: "Speech Failed",
        description: "Could not speak the message",
        variant: "destructive"
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  if (!farmProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4" data-testid="text-no-profile">
              Please create a farm profile first to start chatting with the AI assistant.
            </p>
            <Button 
              onClick={() => window.location.href = '/profile'} 
              data-testid="button-create-profile"
            >
              Create Farm Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-3d-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Floating Question Marks */}
      <div className="question-mark">?</div>
      <div className="question-mark">?</div>
      <div className="question-mark">?</div>
      <div className="question-mark">?</div>
      <div className="question-mark">?</div>


      <Card className="chat-3d-card h-[calc(100vh-12rem)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" data-testid="text-chat-title">
              <Bot className="h-5 w-5 text-primary" />
              {t('chat')}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse"></div>
              <span data-testid="text-status-online">{t('online')}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ask questions about farming, crops, pests, or get personalized advice
          </p>
        </CardHeader>

        {/* Chat Messages */}
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <ScrollArea className="chat-3d-scroll flex-1 p-6">
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="chat-3d-message flex items-start space-x-3" data-testid="message-welcome">
                <div className="chat-3d-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-primary-foreground text-sm h-4 w-4" />
                </div>
                <div className="chat-3d-bubble-bot max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                  <p className="text-sm">
                    {language === 'hi' 
                      ? 'नमस्कार! मैं आपकी खेती में मदद के लिए हूँ। आप क्या जानना चाहते हैं?'
                      : 'Hello! I\'m here to help with your farming needs. What would you like to know?'
                    }
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    AI Assistant
                  </span>
                </div>
              </div>

              {/* No loading state needed here since we're using localStorage */}

              {/* Chat History */}
              {chatHistory?.map((chat, index) => (
                <div key={chat.id} className="space-y-3">
                  {/* User Message */}
                  <div className="chat-3d-message flex items-start space-x-3 justify-end" data-testid={`message-user-${index}`}>
                    <div className="chat-3d-bubble-user max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                      <p className="text-sm text-primary-foreground">{chat.message}</p>
                      <span className="text-xs text-primary-foreground/70 mt-1 block">
                        {formatTime(chat.createdAt)}
                      </span>
                    </div>
                    <div className="chat-3d-avatar w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-accent-foreground text-sm h-4 w-4" />
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="chat-3d-message flex items-start space-x-3" data-testid={`message-bot-${index}`}>
                    <div className="chat-3d-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-primary-foreground text-sm h-4 w-4" />
                    </div>
                    <div className="chat-3d-bubble-bot max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                      <div className="text-sm whitespace-pre-wrap">{chat.response}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.createdAt)}
                        </span>
                        {synthesisSupported && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleSpeakMessage(chat.response)}
                            data-testid={`button-speak-${index}`}
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-3 w-3" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading message while sending */}
              {isLoading && (
                <div className="space-y-3">
                  {/* User's pending message */}
                  <div className="chat-3d-message flex items-start space-x-3 justify-end">
                    <div className="chat-3d-bubble-user max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                      <p className="text-sm text-primary-foreground">{message}</p>
                      <span className="text-xs text-primary-foreground/70 mt-1 block">
                        Sending...
                      </span>
                    </div>
                    <div className="chat-3d-avatar w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-accent-foreground text-sm h-4 w-4" />
                    </div>
                  </div>

                  {/* AI thinking */}
                  <div className="chat-3d-message flex items-start space-x-3">
                    <div className="chat-3d-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-primary-foreground text-sm h-4 w-4" />
                    </div>
                    <div className="chat-3d-bubble-bot max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="chat-3d-loading h-4 w-4" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="flex-shrink-0 p-6 border-t border-border">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex space-x-3">
                <div className="chat-3d-input flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={language === 'hi' ? 'अपना सवाल यहाँ लिखें...' : 'Type your question here...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-12"
                    disabled={isLoading}
                    data-testid="input-chat-message"
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded"
                    onClick={() => {
                      // File attachment placeholder
                      toast({
                        title: "File Upload",
                        description: "Photo upload feature is coming soon!",
                      });
                    }}
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <Button 
                  type="submit"
                  className="chat-3d-button"
                  disabled={!message.trim() || isLoading}
                  data-testid="button-send-message"
                >
                  {isLoading ? (
                    <Loader2 className="chat-3d-loading h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Voice Input Button */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`chat-3d-button ${recognitionSupported ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/50 cursor-not-allowed'}`}
                  onClick={handleVoiceInput}
                  disabled={!recognitionSupported || isLoading}
                  data-testid="button-voice-input"
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4 mr-2 text-destructive animate-pulse" />
                  ) : (
                    <Mic className="h-4 w-4 mr-2" />
                  )}
                  <span>
                    {isRecording 
                      ? (language === 'hi' ? 'रुकें' : 'Stop Recording')
                      : !recognitionSupported 
                        ? (language === 'hi' ? 'आवाज़ समर्थित नहीं' : 'Voice Not Supported')
                        : t('voiceInput')
                    }
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
