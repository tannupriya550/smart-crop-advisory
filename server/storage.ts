import { randomUUID } from "crypto";
import { 
  type FarmProfile, 
  type InsertFarmProfile,
  type CropRecommendation,
  type InsertCropRecommendation,
  type ChatMessage,
  type InsertChatMessage
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
}

export class MemStorage implements IStorage {
  private farmProfiles: Map<string, FarmProfile>;
  private cropRecommendations: Map<string, CropRecommendation>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.farmProfiles = new Map();
    this.cropRecommendations = new Map();
    this.chatMessages = new Map();
  }

  async createFarmProfile(insertProfile: InsertFarmProfile): Promise<FarmProfile> {
    const id = randomUUID();
    const now = new Date();
    const profile: FarmProfile = { 
      ...insertProfile, 
      id, 
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
}

export const storage = new MemStorage();
