export interface EnergyMetrics {
  estimatedEnergy: number;
  estimatedCO2: number;
  energyUnit: string;
  co2Unit: string;
  language: string;
  complexity: number;
  recursionDetected: boolean;
}

const ENERGY_MULTIPLIER = 0.0001; 
const LANGUAGE_MULTIPLIERS: Record<string, number> = {
  "js": 1.0, "jsx": 1.05, "ts": 1.1, "tsx": 1.15,
  "py": 1.8, "rs": 0.4, "go": 0.6, "cpp": 0.35,
  "java": 1.4, "swift": 0.9, "kotlin": 1.25,
};

export function calculateEnergyMetrics(fileSize: number, fileName: string, content: string): EnergyMetrics {
  const lineCount = content.split('\n').length;
  const { complexity, recursionDetected } = estimateComplexityHeuristic(content);
  const ext = fileName.split('.').pop()?.toLowerCase() || "";
  const langMultiplier = LANGUAGE_MULTIPLIERS[ext] || 1.0;
  
  const baseEnergy = (fileSize / 1024) * ENERGY_MULTIPLIER;
  const adjustedEnergy = baseEnergy * complexity * langMultiplier * (1 + lineCount / 1000);
  
  // Mean grid intensity for extension fallback
  const gridIntensity = 400; 
  const estimatedCO2 = adjustedEnergy * gridIntensity;
  
  return {
    estimatedEnergy: Math.round(adjustedEnergy * 1000) / 1000,
    estimatedCO2: Math.round(estimatedCO2 * 100) / 100,
    energyUnit: 'kWh',
    co2Unit: 'gCO2e',
    language: ext,
    complexity: Math.round(complexity * 100) / 100,
    recursionDetected
  };
}

function estimateComplexityHeuristic(content: string): { complexity: number, recursionDetected: boolean } {
  let complexity = 1.0;
  let recursionDetected = false;

  const loopPatterns = /\b(for|while|do|forEach|map|filter|reduce)\b/g;
  complexity += (content.match(loopPatterns) || []).length * 0.15;

  const asyncPatterns = /\b(async|await|Promise|fetch)\b/g;
  complexity += (content.match(asyncPatterns) || []).length * 0.1;

  // Simple heuristic for recursion: function calling itself by name in the body
  // We look for function definitions and then search for that name following a call-like bracket
  const funcDefMatch = content.match(/function\s+(\w+)\s*\(/);
  if (funcDefMatch && funcDefMatch[1]) {
    const name = funcDefMatch[1];
    const selfCallRegex = new RegExp(`\\b${name}\\s*\\(`, 'g');
    const calls = content.match(selfCallRegex) || [];
    if (calls.length > 1) { // 1 for def, >1 means it's called somewhere, likely inside itself if it's the only func
      recursionDetected = true;
      complexity += 1.2;
    }
  }

  return { 
    complexity: Math.min(complexity, 5.0), 
    recursionDetected 
  };
}
