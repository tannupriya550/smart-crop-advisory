import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertFarmProfileSchema,
  insertCropRecommendationSchema,
  insertChatMessageSchema,
  insertDetectionResultSchema,
} from "@shared/schema";
import OpenAI from "openai";
import { pestDatabase, type PestData } from "../client/src/lib/pest-data";
import axios from "axios";

// ✅ Import your auth routes
import authRoutes from "./routes/auth";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_KEY ||
    "your-api-key-here",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ✅ Auth routes (login + signup)
  app.use("/api/auth", authRoutes);

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
      const profile = await storage.updateFarmProfile(
        req.params.id,
        updateData
      );
      if (!profile) {
        return res.status(404).json({ message: "Farm profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ✅ Keep the rest of your routes (crop recommendations, chat, detections) unchanged…

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to map detected classes to pest database
function findMatchingPest(detectedClass: string): PestData | null {
  const normalizedClass = detectedClass.toLowerCase().replace(/[_-]/g, " ");

  // Direct name matching
  let match = pestDatabase.find(
    (pest) =>
      pest.name.toLowerCase().includes(normalizedClass) ||
      normalizedClass.includes(pest.name.toLowerCase().split(" ")[0])
  );

  if (match) return match;

  // Symptom-based matching for common disease patterns
  const diseaseKeywords = {
    blight: ["leaf blight", "blight"],
    spot: ["leaf blight", "spot"],
    worm: ["bollworm", "stem borer"],
    aphid: ["aphids"],
    fly: ["whitefly"],
    rust: ["leaf blight"],
    bacterial: ["leaf blight"],
  };

  for (const [keyword, pestNames] of Object.entries(diseaseKeywords)) {
    if (normalizedClass.includes(keyword)) {
      match = pestDatabase.find((pest) =>
        pestNames.some((name) =>
          pest.name.toLowerCase().includes(name.toLowerCase())
        )
      );
      if (match) return match;
    }
  }

  return null;
}
