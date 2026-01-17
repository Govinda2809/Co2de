export interface EnergyMetrics {
  estimatedEnergy: number;
  estimatedCO2: number;
  energyUnit: string;
  co2Unit: string;
  language: string;
  complexity: number;
}

const ENERGY_MULTIPLIER = 0.0001; 
const LANGUAGE_MULTIPLIERS: Record<string, number> = {
  "js": 1.0,
  "ts": 1.1,
  "py": 1.8,
  "rs": 0.4,
  "go": 0.6,
  "cpp": 0.35,
  "java": 1.4,
};

export function calculateEnergyMetrics(fileSize: number, fileName: string, content: string): EnergyMetrics {
  const lineCount = content.split('\n').length;
  const complexity = estimateComplexity(content);
  const ext = fileName.split('.').pop()?.toLowerCase() || "";
  const langMultiplier = LANGUAGE_MULTIPLIERS[ext] || 1.0;
  
  const baseEnergy = (fileSize / 1024) * ENERGY_MULTIPLIER;
  const adjustedEnergy = baseEnergy * complexity * langMultiplier * (1 + lineCount / 1000);
  
  // Using a mean grid intensity of 400g/kWh for extension fallback
  const gridIntensity = 400; 
  const estimatedCO2 = adjustedEnergy * gridIntensity;
  
  return {
    estimatedEnergy: Math.round(adjustedEnergy * 1000) / 1000,
    estimatedCO2: Math.round(estimatedCO2 * 100) / 100,
    energyUnit: 'kWh',
    co2Unit: 'gCO2e',
    language: ext,
    complexity: Math.round(complexity * 100) / 100,
  };
}

function estimateComplexity(content: string): number {
  let complexity = 1;
  const loopPatterns = /\b(for|while|do|forEach|map|filter|reduce)\b/g;
  complexity += (content.match(loopPatterns) || []).length * 0.1;
  const asyncPatterns = /\b(async|await|Promise|fetch)\b/g;
  complexity += (content.match(asyncPatterns) || []).length * 0.05;
  return Math.min(complexity, 3);
}
