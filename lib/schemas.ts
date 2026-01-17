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
});

// Matches Appwrite Collection Structure exactly
// Added optional fields for advanced metrics to maintain backward compatibility
export const AnalysisItemSchema = z.object({
  $id: z.string().optional(),
  fileName: z.string().min(1),
  fileSize: z.number().nonnegative(),
  fileId: z.string().min(1),
  estimatedEnergy: z.number().nonnegative(),
  estimatedCO2: z.number().nonnegative(),
  score: z.number().min(0).max(10),
  bottleneck: z.string(),
  optimization: z.string(),
  improvement: z.string(),
  createdAt: z.string(),
  userId: z.string().optional(),
  complexity: z.number().optional(),
  memPressure: z.number().optional(),
  lineCount: z.number().optional(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;
export type AIReview = z.infer<typeof AIReviewSchema>;
export type AnalysisItem = z.infer<typeof AnalysisItemSchema>;
