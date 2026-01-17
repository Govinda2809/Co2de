import { z } from 'zod';

export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive'),
  type: z.string(),
  content: z.string().optional(),
});

export const AIReviewSchema = z.object({
  score: z.number().min(1).max(10),
  bottleneck: z.string(),
  optimization: z.string(),
  improvement: z.string(),
  dependencies: z.array(z.object({
    name: z.string(),
    impact: z.string(),
    alternative: z.string()
  })).optional(),
});

/**
 * PROTOCOL_GRADE_V4.0_SCHEMA
 * Unified schema for high-fidelity code sustainability audits.
 * Optimized for Appwrite NoSQL document storage.
 */
export const AnalysisItemSchema = z.object({
  // Metadata & System
  $id: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string(),
  engineVersion: z.string().default('4.0.0-gamma'),
  
  // File Informatics
  fileName: z.string().min(1),
  fileSize: z.number().nonnegative(),
  fileId: z.string().min(1),
  lineCount: z.number().optional(),
  language: z.string().optional(),

  // Primary Metrics
  estimatedEnergy: z.number().nonnegative(), // kWh
  estimatedCO2: z.number().nonnegative(),    // gCO2e
  score: z.number().min(0).max(10),

  // Infrastructure Context
  region: z.string().optional(),
  hardwareProfile: z.string().optional(),
  gridIntensity: z.number().optional(),      // gCO2e/kWh
  pueFactor: z.number().optional(),

  // High-Fidelity Heuristics
  complexity: z.number().optional(),         // Big O Factor
  memPressure: z.number().optional(),        // Allocation Factor
  recursionDetected: z.boolean().optional(),
  
  // AI Insights
  bottleneck: z.string(),
  optimization: z.string(),
  improvement: z.string(),
  dependencies: z.array(z.object({
    name: z.string(),
    impact: z.string(),
    alternative: z.string()
  })).optional(),
  
  // Delta Context (Optional)
  optimizationDelta: z.number().optional(), // Percentage vs Original
});

export type FileUpload = z.infer<typeof FileUploadSchema>;
export type AIReview = z.infer<typeof AIReviewSchema>;
export type AnalysisItem = z.infer<typeof AnalysisItemSchema>;
