import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const farmProfiles = pgTable("farm_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerName: text("farmer_name").notNull(),
  location: text("location").notNull(),
  farmSize: real("farm_size").notNull(), // in acres
  soilType: text("soil_type").notNull(),
  irrigation: text("irrigation").notNull(),
  previousCrops: jsonb("previous_crops").$type<string[]>().default([]),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const cropRecommendations = pgTable("crop_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => farmProfiles.id),
  cropName: text("crop_name").notNull(),
  season: text("season").notNull(),
  matchPercentage: real("match_percentage").notNull(),
  expectedYield: real("expected_yield").notNull(),
  estimatedIncome: real("estimated_income").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow()
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => farmProfiles.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertFarmProfileSchema = createInsertSchema(farmProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCropRecommendationSchema = createInsertSchema(cropRecommendations).omit({
  id: true,
  createdAt: true
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true
});

export type InsertFarmProfile = z.infer<typeof insertFarmProfileSchema>;
export type FarmProfile = typeof farmProfiles.$inferSelect;
export type InsertCropRecommendation = z.infer<typeof insertCropRecommendationSchema>;
export type CropRecommendation = typeof cropRecommendations.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Detection Results Schema
export const detectionResults = pgTable("detection_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").references(() => farmProfiles.id),
  detectedClass: text("detected_class").notNull(),
  confidence: real("confidence").notNull(),
  alternatives: jsonb("alternatives").$type<Array<{class: string, confidence: number}>>().default([]),
  matchedPestId: text("matched_pest_id"), // references pest from pestDatabase
  imageUrl: text("image_url"), // optional - for storing processed image
  notes: jsonb("notes").$type<string[]>().default([]), // treatment tips, recommendations
  createdAt: timestamp("created_at").defaultNow()
});

export const insertDetectionResultSchema = createInsertSchema(detectionResults).omit({
  id: true,
  createdAt: true
});

export type InsertDetectionResult = z.infer<typeof insertDetectionResultSchema>;
export type DetectionResult = typeof detectionResults.$inferSelect;
