import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFarmProfileSchema, insertCropRecommendationSchema, insertChatMessageSchema } from "@shared/schema";
import OpenAI from "openai";

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

  const httpServer = createServer(app);
  return httpServer;
}
