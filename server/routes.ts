import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFarmProfileSchema, insertCropRecommendationSchema, insertChatMessageSchema, insertDetectionResultSchema } from "@shared/schema";
import OpenAI from "openai";
import { pestDatabase, type PestData } from "../client/src/lib/pest-data";
import axios from "axios";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Farm Profile routes
  app.post("/api/farm-profile", async (req, res) => {
    try {
      const validatedData = insertFarmProfileSchema.parse(req.body);
      const profile = await storage.createFarmProfile(validatedData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/farm-profile/:id", async (req, res) => {
    try {
      const profile = await storage.getFarmProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Farm profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/farm-profile/:id", async (req, res) => {
    try {
      const updateData = insertFarmProfileSchema.partial().parse(req.body);
      const profile = await storage.updateFarmProfile(req.params.id, updateData);
      if (!profile) {
        return res.status(404).json({ message: "Farm profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Crop Recommendations routes
  app.post("/api/crop-recommendations", async (req, res) => {
    try {
      const validatedData = insertCropRecommendationSchema.parse(req.body);
      const recommendation = await storage.createCropRecommendation(validatedData);
      res.json(recommendation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/crop-recommendations/:profileId", async (req, res) => {
    try {
      const recommendations = await storage.getCropRecommendationsByProfile(req.params.profileId);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { profileId, message, language } = req.body;
      
      if (!profileId || !message || !language) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get farm profile for context
      const profile = await storage.getFarmProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Farm profile not found" });
      }

      // Generate AI response
      const systemPrompt = `You are an experienced agricultural advisor helping small farmers in India. 
        Respond in ${language === 'hi' ? 'Hindi' : language === 'en' ? 'English' : language}. 
        Provide practical, actionable advice for farming. Keep responses concise and farmer-friendly.
        
        Farmer context:
        - Location: ${profile.location}
        - Farm size: ${profile.farmSize} acres
        - Soil type: ${profile.soilType}
        - Irrigation: ${profile.irrigation}
        - Previous crops: ${profile.previousCrops?.join(', ') || 'None'}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content || "I apologize, I couldn't generate a response. Please try again.";

      // Save chat message
      const chatMessage = await storage.createChatMessage({
        profileId,
        message,
        response,
        language
      });

      res.json({ response, messageId: chatMessage.id });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  app.get("/api/chat/:profileId", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesByProfile(req.params.profileId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate crop recommendations using AI
  app.post("/api/generate-recommendations", async (req, res) => {
    try {
      const { profileId, season } = req.body;
      
      const profile = await storage.getFarmProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Farm profile not found" });
      }

      const prompt = `As an agricultural expert, recommend the top 3 crops for a farmer with these details:
        Location: ${profile.location}
        Farm size: ${profile.farmSize} acres
        Soil type: ${profile.soilType}
        Season: ${season}
        Previous crops: ${profile.previousCrops?.join(', ') || 'None'}
        
        Provide response as JSON with this structure:
        {
          "recommendations": [
            {
              "cropName": "string",
              "matchPercentage": number,
              "expectedYield": number,
              "estimatedIncome": number,
              "recommendations": ["tip1", "tip2", "tip3"]
            }
          ]
        }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"recommendations":[]}');
      
      // Save recommendations to storage
      const savedRecommendations = await Promise.all(
        result.recommendations.map((rec: any) => 
          storage.createCropRecommendation({
            profileId,
            season,
            ...rec
          })
        )
      );

      res.json(savedRecommendations);
    } catch (error: any) {
      console.error("Recommendation generation error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Image Detection routes
  app.post("/api/detections", async (req, res) => {
    try {
      const { imageBase64, profileId, topK = 3 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Validate image format
      if (!imageBase64.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image format. Please provide a base64 data URL." });
      }

      // Extract base64 data without the data URL prefix
      const base64Data = imageBase64.split(',')[1];
      if (!base64Data) {
        return res.status(400).json({ message: "Invalid image data" });
      }

      // Call Roboflow API for crop disease detection
      const roboflowResponse = await axios({
        method: "POST",
        url: "https://serverless.roboflow.com/fyp-advun/crop-disease-2rilx/4", // Using high-accuracy model
        params: {
          api_key: process.env.ROBOFLOW_API_KEY,
          confidence: 0.4, // Lower threshold for better detection
          overlap: 0.3
        },
        data: base64Data,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const predictions = roboflowResponse.data.predictions || [];
      
      if (predictions.length === 0) {
        return res.json({
          id: null,
          detectedClass: "healthy",
          confidence: 0.95,
          alternatives: [],
          matchedPest: null,
          notes: ["No diseases or pests detected. Your crop appears healthy!"],
          recommendations: ["Continue regular monitoring", "Maintain good field hygiene", "Follow preventive care practices"]
        });
      }

      // Get the top prediction
      const topPrediction = predictions.reduce((prev: any, current: any) => 
        (current.confidence > prev.confidence) ? current : prev
      );

      // Get alternatives (other predictions)
      const alternatives = predictions
        .filter((p: any) => p.class !== topPrediction.class)
        .slice(0, topK - 1)
        .map((p: any) => ({
          class: p.class,
          confidence: Math.round(p.confidence * 100) / 100
        }));

      // Map detected class to pest database
      const matchedPest = findMatchingPest(topPrediction.class);
      
      // Generate notes and recommendations
      const notes: string[] = [];
      const recommendations: string[] = [];
      
      if (matchedPest) {
        notes.push(`Detected: ${matchedPest.name}`);
        notes.push(`Severity: ${matchedPest.severity} risk`);
        notes.push(`Commonly affects: ${matchedPest.crops.join(', ')}`);
        recommendations.push(...matchedPest.treatment.slice(0, 3));
      } else {
        notes.push(`Detected: ${topPrediction.class.replace(/_/g, ' ').toUpperCase()}`);
        notes.push("Consider consulting with a local agricultural expert for specific treatment advice.");
        recommendations.push("Monitor the affected area closely");
        recommendations.push("Take additional photos if symptoms worsen");
        recommendations.push("Consider organic treatment options first");
      }

      // Create detection result
      const detectionData = {
        profileId,
        detectedClass: topPrediction.class,
        confidence: Math.round(topPrediction.confidence * 100) / 100,
        alternatives,
        matchedPestId: matchedPest?.id || null,
        notes
      };

      const validatedData = insertDetectionResultSchema.parse(detectionData);
      const savedResult = await storage.createDetectionResult(validatedData);

      // Return enriched response
      res.json({
        ...savedResult,
        matchedPest,
        recommendations
      });

    } catch (error: any) {
      console.error("Detection error:", error);
      if (error.response?.status === 401) {
        return res.status(401).json({ message: "Invalid API key. Please check your Roboflow API configuration." });
      }
      if (error.response?.status === 429) {
        return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
      }
      res.status(500).json({ message: "Failed to process image for detection" });
    }
  });

  app.get("/api/detections/:id", async (req, res) => {
    try {
      const result = await storage.getDetectionResult(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Detection result not found" });
      }
      
      // Enrich with matched pest data
      const matchedPest = result.matchedPestId ? 
        pestDatabase.find(p => p.id === result.matchedPestId) : null;
      
      res.json({
        ...result,
        matchedPest
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/detections/profile/:profileId", async (req, res) => {
    try {
      const results = await storage.getDetectionResultsByProfile(req.params.profileId);
      
      // Enrich with matched pest data
      const enrichedResults = results.map(result => {
        const matchedPest = result.matchedPestId ? 
          pestDatabase.find(p => p.id === result.matchedPestId) : null;
        return {
          ...result,
          matchedPest
        };
      });
      
      res.json(enrichedResults);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to map detected classes to pest database
function findMatchingPest(detectedClass: string): PestData | null {
  const normalizedClass = detectedClass.toLowerCase().replace(/[_-]/g, ' ');
  
  // Direct name matching
  let match = pestDatabase.find(pest => 
    pest.name.toLowerCase().includes(normalizedClass) ||
    normalizedClass.includes(pest.name.toLowerCase().split(' ')[0])
  );
  
  if (match) return match;
  
  // Symptom-based matching for common disease patterns
  const diseaseKeywords = {
    'blight': ['leaf blight', 'blight'],
    'spot': ['leaf blight', 'spot'], 
    'worm': ['bollworm', 'stem borer'],
    'aphid': ['aphids'],
    'fly': ['whitefly'],
    'rust': ['leaf blight'],
    'bacterial': ['leaf blight']
  };
  
  for (const [keyword, pestNames] of Object.entries(diseaseKeywords)) {
    if (normalizedClass.includes(keyword)) {
      match = pestDatabase.find(pest => 
        pestNames.some(name => pest.name.toLowerCase().includes(name.toLowerCase()))
      );
      if (match) return match;
    }
  }
  
  return null;
}
