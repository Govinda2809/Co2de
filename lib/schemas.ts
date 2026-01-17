import { z } from 'zod';

export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive'),
  type: z.string(),
  content: z.string().optional(),
});

export const EnergyMetricsSchema = z.object({
  fileId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  estimatedEnergy: z.number(),
  estimatedCO2: z.number(),
  uploadedAt: z.string(),
});

export const AIReviewSchema = z.object({
  score: z.number().min(1).max(10),
  bottleneck: z.string(),
  optimization: z.string(),
  improvement: z.string(),
});

export const AnalysisResultSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  metrics: z.object({
    estimatedEnergy: z.number(),
    estimatedCO2: z.number(),
    energyUnit: z.string(),
    co2Unit: z.string(),
  }),
  review: AIReviewSchema,
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.string(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;
export type EnergyMetrics = z.infer<typeof EnergyMetricsSchema>;
export type AIReview = z.infer<typeof AIReviewSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
