import { z } from 'zod';

export const FileUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive'),
  type: z.string(),
  content: z.string().optional(),
});

/**
 * DEPENDENCY_SCHEMA_V5.0
 * Enhanced dependency tracking with severity levels and bundle impact.
 */
export const DependencySchema = z.object({
  name: z.string(),
  impact: z.string(),
  alternative: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  bundleSizeKb: z.number().optional(),
  category: z.enum(['runtime', 'devtool', 'utility', 'framework', 'polyfill']).optional(),
});

/**
 * HOTSPOT_SCHEMA_V5.0
 * Performance hotspots detected by AI.
 */
export const HotspotSchema = z.object({
  line: z.number().optional(),
  description: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
});

/**
 * CARBON_PROJECTION_SCHEMA_V5.0
 * Time-scaled carbon footprint projections.
 */
export const CarbonProjectionSchema = z.object({
  daily: z.number().optional(),      // kg CO2e
  weekly: z.number().optional(),     // kg CO2e
  monthly: z.number().optional(),    // kg CO2e
  biannual: z.number().optional(),   // kg CO2e
  annual: z.number().optional(),     // kg CO2e
  treesToOffset: z.number().optional(),
  scope2: z.number().optional(),     // kg CO2e (electricity)
  scope3: z.number().optional(),     // kg CO2e (upstream/downstream)
});

/**
 * AI_REVIEW_SCHEMA_V5.0
 * Comprehensive AI-generated sustainability review with code explanations.
 */
export const AIReviewSchema = z.object({
  score: z.number().min(1).max(10),
  bottleneck: z.string(),
  optimization: z.string(),
  improvement: z.string(),
  summary: z.string().optional(),
  dependencies: z.array(DependencySchema).optional(),
  securityNotes: z.string().optional(),
  hotspots: z.array(HotspotSchema).optional(),
});

/**
 * GEOLOCATION_SCHEMA_V5.0
 * Real-time client location data for infrastructure optimization.
 */
export const GeolocationSchema = z.object({
  ip: z.string(),
  country: z.string(),
  countryCode: z.string(),
  region: z.string(),
  city: z.string(),
  lat: z.number(),
  lon: z.number(),
  timezone: z.string(),
  isp: z.string(),
  gridIntensity: z.number(),
});

/**
 * PROTOCOL_GRADE_V5.0_SCHEMA
 * Unified schema for high-fidelity code sustainability audits.
 * Enhanced with carbon projections, geolocation, and real-time data.
 */
export const AnalysisItemSchema = z.object({
  // Metadata & System
  $id: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string(),
  engineVersion: z.string().default('5.0.0-delta'),

  // File Informatics
  fileName: z.string().min(1),
  fileSize: z.number().nonnegative(),
  fileId: z.string().min(1),
  lineCount: z.number().optional(),
  language: z.string().optional(),

  // Primary Metrics
  estimatedEnergy: z.number().nonnegative(), // kWh per execution
  estimatedCO2: z.number().nonnegative(),    // gCO2e per execution
  score: z.number().min(0).max(10),

  // Infrastructure Context (Enhanced with Geolocation)
  region: z.string().optional(),
  hardwareProfile: z.string().optional(),
  gridIntensity: z.number().optional(),      // gCO2e/kWh
  pueFactor: z.number().optional(),
  clientCity: z.string().optional(),
  clientCountry: z.string().optional(),
  clientIp: z.string().optional(),

  // High-Fidelity Heuristics
  complexity: z.number().optional(),         // Big O Factor
  memPressure: z.number().optional(),        // Allocation Factor
  recursionDetected: z.boolean().optional(),

  // AI Insights (Enhanced)
  bottleneck: z.string().optional(),
  optimization: z.string().optional(),
  improvement: z.string().optional(),
  summary: z.string().optional(),
  dependencies: z.array(DependencySchema).optional(),
  securityNotes: z.string().optional(),
  hotspots: z.array(HotspotSchema).optional(),

  // Carbon Projections (NEW)
  carbonProjections: CarbonProjectionSchema.optional(),
  executionsPerDay: z.number().optional(),

  // Delta Context
  optimizationDelta: z.number().optional(),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;
export type AIReview = z.infer<typeof AIReviewSchema>;
export type AnalysisItem = z.infer<typeof AnalysisItemSchema>;
export type Geolocation = z.infer<typeof GeolocationSchema>;
export type Dependency = z.infer<typeof DependencySchema>;
export type Hotspot = z.infer<typeof HotspotSchema>;
export type CarbonProjection = z.infer<typeof CarbonProjectionSchema>;
