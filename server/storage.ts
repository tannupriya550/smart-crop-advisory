import { randomUUID } from "crypto";
import { 
  type FarmProfile, 
  type InsertFarmProfile,
  type CropRecommendation,
  type InsertCropRecommendation,
  type ChatMessage,
  type InsertChatMessage,
  type DetectionResult,
  type InsertDetectionResult
} from "@shared/schema";

export interface IStorage {
  // Farm Profile operations
  createFarmProfile(profile: InsertFarmProfile): Promise<FarmProfile>;
  getFarmProfile(id: string): Promise<FarmProfile | undefined>;
  updateFarmProfile(id: string, profile: Partial<InsertFarmProfile>): Promise<FarmProfile | undefined>;
  
  // Crop Recommendation operations
  createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation>;
  getCropRecommendationsByProfile(profileId: string): Promise<CropRecommendation[]>;
  
  // Chat Message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByProfile(profileId: string): Promise<ChatMessage[]>;
  
  // Detection Result operations
  createDetectionResult(result: InsertDetectionResult): Promise<DetectionResult>;
  getDetectionResult(id: string): Promise<DetectionResult | undefined>;
  getDetectionResultsByProfile(profileId: string): Promise<DetectionResult[]>;
}

export class MemStorage implements IStorage {
  private farmProfiles: Map<string, FarmProfile>;
  private cropRecommendations: Map<string, CropRecommendation>;
  private chatMessages: Map<string, ChatMessage>;
  private detectionResults: Map<string, DetectionResult>;

  constructor() {
    this.farmProfiles = new Map();
    this.cropRecommendations = new Map();
    this.chatMessages = new Map();
    this.detectionResults = new Map();
  }

  async createFarmProfile(insertProfile: InsertFarmProfile): Promise<FarmProfile> {
    const id = randomUUID();
    const now = new Date();
    const profile: FarmProfile = { 
      ...insertProfile, 
      id, 
      previousCrops: (insertProfile.previousCrops || []) as string[],
      language: insertProfile.language || 'en',
      createdAt: now,
      updatedAt: now 
    };
    this.farmProfiles.set(id, profile);
    return profile;
  }

  async getFarmProfile(id: string): Promise<FarmProfile | undefined> {
    return this.farmProfiles.get(id);
  }

  async updateFarmProfile(id: string, updateData: Partial<InsertFarmProfile>): Promise<FarmProfile | undefined> {
    const existing = this.farmProfiles.get(id);
    if (!existing) return undefined;
    
    const updated: FarmProfile = {
      ...existing,
      ...updateData,
      previousCrops: updateData.previousCrops ? updateData.previousCrops as string[] : existing.previousCrops,
      updatedAt: new Date()
    };
    this.farmProfiles.set(id, updated);
    return updated;
  }

  async createCropRecommendation(insertRecommendation: InsertCropRecommendation): Promise<CropRecommendation> {
    const id = randomUUID();
    const recommendation: CropRecommendation = {
      ...insertRecommendation,
      id,
      profileId: insertRecommendation.profileId || null,
      recommendations: (insertRecommendation.recommendations || []) as string[],
      createdAt: new Date()
    };
    this.cropRecommendations.set(id, recommendation);
    return recommendation;
  }

  async getCropRecommendationsByProfile(profileId: string): Promise<CropRecommendation[]> {
    return Array.from(this.cropRecommendations.values())
      .filter(rec => rec.profileId === profileId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      profileId: insertMessage.profileId || null,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesByProfile(profileId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.profileId === profileId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createDetectionResult(insertResult: InsertDetectionResult): Promise<DetectionResult> {
    const id = randomUUID();
    const result: DetectionResult = {
      ...insertResult,
      id,
      profileId: insertResult.profileId || null,
      alternatives: (insertResult.alternatives || []) as Array<{class: string, confidence: number}>,
      matchedPestId: insertResult.matchedPestId || null,
      imageUrl: insertResult.imageUrl || null,
      notes: (insertResult.notes || []) as string[],
      createdAt: new Date()
    };
    this.detectionResults.set(id, result);
    return result;
  }

  async getDetectionResult(id: string): Promise<DetectionResult | undefined> {
    return this.detectionResults.get(id);
  }

  async getDetectionResultsByProfile(profileId: string): Promise<DetectionResult[]> {
    return Array.from(this.detectionResults.values())
      .filter(result => result.profileId === profileId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
}

export const storage = new MemStorage();
