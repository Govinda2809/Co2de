import { AIReview } from './schemas';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

// Avg Energy Multiplier: Roughly 0.1Wh per 1k lines/complexity unit
const ENERGY_MULTIPLIER = 0.0001;

// REGIONAL PUE (Power Usage Effectiveness)
// Lower is better. 1.1 = Highly efficient (Google/Microsoft), 1.6 = Standard
export const REGIONS = {
  "north-america": { label: "North America (PUE 1.15)", factor: 1.15, intensity: 450 },
  "europe": { label: "Europe (PUE 1.12)", factor: 1.12, intensity: 320 },
  "asia": { label: "Asia (PUE 1.35)", factor: 1.35, intensity: 580 },
  "australia": { label: "Australia (PUE 1.40)", factor: 1.4, intensity: 620 },
  "nordics": { label: "Nordics (PUE 1.08)", factor: 1.08, intensity: 120 },
};

// HARDWARE PROFILES (Energy Draw per instruction base)
export const HARDWARE_PROFILES = {
  "mobile": { label: "Mobile (ARM)", factor: 0.4 },
  "laptop": { label: "Workstation", factor: 1.0 },
  "server": { label: "Enterprise Server (HPC)", factor: 2.5 },
};

const LANGUAGE_MULTIPLIERS: Record<string, number> = {
  "js": 1.0,
  "ts": 1.1,
  "py": 1.8,
  "rs": 0.4,
  "go": 0.6,
  "cpp": 0.35,
  "java": 1.4,
};

export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || "";
  return LANGUAGE_MULTIPLIERS[ext] ? ext : "js";
}

export async function getGridIntensity(region: string = "europe"): Promise<number> {
  const base = (REGIONS as any)[region]?.intensity || 320;
  const currentHour = new Date().getHours();
  // Simulate peak/off-peak logic
  const intensityFactor = currentHour > 22 || currentHour < 6 ? 0.75 : 1.15;
  return Math.round(base * intensityFactor);
}

function calculateASTComplexity(content: string, lang: string): number {
  let complexity = 1.0;
  if (lang !== 'js' && lang !== 'ts') return estimateComplexityRegex(content);

  try {
    const tree = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'module' });
    let loopCount = 0;
    let bigOfactor = 0;

    walk.simple(tree, {
      ForStatement() { loopCount++; },
      WhileStatement() { loopCount++; },
      DoWhileStatement() { loopCount++; },
      FunctionDeclaration(node: any) {
        let nested = 0;
        walk.simple(node.body, {
          ForStatement() { nested++; },
          WhileStatement() { nested++; },
        });
        if (nested > 1) bigOfactor += 0.8;
      },
      CallExpression(node: any) {
        if (node.callee.property && ['map', 'filter', 'forEach', 'reduce'].includes(node.callee.property.name)) {
          loopCount += 0.5;
        }
      }
    });
    complexity += (loopCount * 0.15) + bigOfactor;
  } catch (e) {
    return estimateComplexityRegex(content);
  }
  return Math.min(complexity, 5.0);
}

function estimateComplexityRegex(content: string): number {
  let complexity = 1.0;
  const loopPatterns = /\b(for|while|do|forEach|map|filter|reduce)\b/g;
  const loops = (content.match(loopPatterns) || []).length;
  complexity += loops * 0.1;
  const nestedPatterns = /\{\s*\{|\[\s*\[/g;
  const nested = (content.match(nestedPatterns) || []).length;
  complexity += nested * 0.15;
  return Math.min(complexity, 3.0);
}

export function getDeterministicReview(code: string, metrics: any): AIReview {
  const score = Math.max(1, 10 - Math.floor(metrics.complexity * 2));
  return {
    score,
    bottleneck: metrics.complexity > 2 ? "High time complexity detected via AST parsing." : "Standard execution overhead.",
    optimization: metrics.complexity > 2 ? "Refactor nested loops into O(1) lookups." : "Optimize variable scoping.",
    improvement: `${Math.round(metrics.complexity * 5)}% Energy reduction possible.`
  };
}

export async function calculateEnergyMetrics(
  fileSize: number, 
  fileName: string, 
  content?: string,
  region: string = "europe",
  hardware: string = "laptop"
) {
  const lineCount = content ? content.split('\n').length : Math.ceil(fileSize / 50);
  const lang = detectLanguage(fileName);
  const complexity = content ? calculateASTComplexity(content, lang) : 1;
  const langMultiplier = LANGUAGE_MULTIPLIERS[lang] || 1.0;
  
  const regionData = (REGIONS as any)[region];
  const hardwareData = (HARDWARE_PROFILES as any)[hardware];

  const baseEnergy = (fileSize / 1024) * ENERGY_MULTIPLIER;
  // Final Adjusted Energy considering Hardware and Datacenter Efficiency (PUE)
  const adjustedEnergy = baseEnergy * complexity * langMultiplier * hardwareData.factor * regionData.factor * (1 + lineCount / 1000);
  
  const gridIntensity = await getGridIntensity(region); 
  const estimatedCO2 = adjustedEnergy * gridIntensity;
  
  return {
    estimatedEnergy: Math.round(adjustedEnergy * 1000) / 1000,
    estimatedCO2: Math.round(estimatedCO2 * 100) / 100,
    energyUnit: 'kWh',
    co2Unit: 'gCO2e',
    gridIntensity,
    lineCount,
    language: lang,
    complexity: Math.round(complexity * 100) / 100,
  };
}

export async function getAIReview(code: string, metrics?: any): Promise<AIReview> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, metrics, mode: 'analyze' }),
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    return data.review;
  } catch (e) {
    return getDeterministicReview(code, metrics || { complexity: 1, language: 'js', lineCount: code.split('\n').length });
  }
}

export async function getAIRefactor(code: string): Promise<{ refactoredCode: string; explanation: string }> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, mode: 'refactor' }),
    });
    if (!response.ok) throw new Error();
    return await response.json();
  } catch (e) {
    return { 
      refactoredCode: code, 
      explanation: "Self-correction algorithm failed. Please optimize manually by reducing loop depth." 
    };
  }
}
