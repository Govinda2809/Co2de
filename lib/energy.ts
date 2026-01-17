import { AIReview } from './schemas';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const ENERGY_MULTIPLIER = 0.0001;

export const REGIONS = {
  "north-america": { label: "North America (PUE 1.15)", factor: 1.15, intensity: 450, bestHour: 3 },
  "europe": { label: "Europe (PUE 1.12)", factor: 1.12, intensity: 320, bestHour: 4 },
  "asia": { label: "Asia (PUE 1.35)", factor: 1.35, intensity: 580, bestHour: 2 },
  "australia": { label: "Australia (PUE 1.40)", factor: 1.4, intensity: 620, bestHour: 1 },
  "nordics": { label: "Nordics (PUE 1.08)", factor: 1.08, intensity: 120, bestHour: 12 },
};

export const HARDWARE_PROFILES = {
  "mobile": { label: "Mobile (ARM)", factor: 0.4 },
  "laptop": { label: "Workstation", factor: 1.0 },
  "server": { label: "Enterprise Server (HPC)", factor: 2.5 },
};

const LANGUAGE_MULTIPLIERS: Record<string, number> = {
  "js": 1.0, "jsx": 1.05, "ts": 1.1, "tsx": 1.15, "py": 1.8, "rs": 0.4, "go": 0.6, "cpp": 0.35, "c": 0.3, "h": 0.3, "java": 1.4, "swift": 0.9, "kotlin": 1.25, "rb": 1.9, "php": 1.6,
};

export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || "";
  return LANGUAGE_MULTIPLIERS[ext] ? ext : "js";
}

export async function getGridIntensity(region: string = "europe"): Promise<number> {
  const base = (REGIONS as any)[region]?.intensity || 320;
  const currentHour = new Date().getHours();
  const intensityFactor = currentHour > 22 || currentHour < 6 ? 0.75 : 1.15;
  return Math.round(base * intensityFactor);
}

function calculateASTComplexity(content: string, lang: string): { complexity: number, memPressure: number, recursionDetected: boolean } {
  let complexity = 1.0;
  let memPressure = 1.0;
  let recursionDetected = false;
  const isJSish = ['js', 'jsx', 'ts', 'tsx'].includes(lang);
  
  if (!isJSish) return { complexity: estimateComplexityRegex(content), memPressure: 1.0, recursionDetected: false };

  try {
    const tree = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'module' });
    let loopCount = 0;
    let bigOfactor = 0;
    let allocations = 0;

    walk.simple(tree, {
      ForStatement() { loopCount++; },
      WhileStatement() { loopCount++; },
      DoWhileStatement() { loopCount++; },
      FunctionDeclaration(node: any) {
        const funcName = node.id?.name;
        let nested = 0;
        let selfCall = false;
        
        walk.simple(node.body, { 
          ForStatement() { nested++; }, 
          WhileStatement() { nested++; },
          CallExpression(callNode: any) {
            if (funcName && (callNode.callee.name === funcName || (callNode.callee.property && callNode.callee.property.name === funcName))) {
              selfCall = true;
            }
          }
        });
        
        if (nested > 1) bigOfactor += 0.8;
        if (selfCall) {
          recursionDetected = true;
          bigOfactor += 1.5; // High cost for recursion
        }
      },
      VariableDeclarator(node: any) {
        if (node.init?.type === 'ArrayExpression' || node.init?.type === 'ObjectExpression') {
          allocations += 0.2;
        }
      },
      CallExpression(node: any) {
        if (node.callee.property && ['map', 'filter', 'forEach', 'reduce', 'push', 'concat'].includes(node.callee.property.name)) {
          loopCount += 0.5;
        }
      }
    });
    complexity += (loopCount * 0.15) + bigOfactor;
    memPressure += allocations;
  } catch (e) {
    return { complexity: estimateComplexityRegex(content), memPressure: 1.0, recursionDetected: false };
  }
  return { complexity: Math.min(complexity, 5.0), memPressure: Math.min(memPressure, 2.5), recursionDetected };
}

function estimateComplexityRegex(content: string): number {
  let complexity = 1.0;
  const loopPatterns = /\b(for|while|do|forEach|map|filter|reduce)\b/g;
  const loops = (content.match(loopPatterns) || []).length;
  complexity += loops * 0.15;
  return Math.min(complexity, 3.0);
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
  const { complexity, memPressure, recursionDetected } = content ? calculateASTComplexity(content, lang) : { complexity: 1, memPressure: 1, recursionDetected: false };
  const langMultiplier = LANGUAGE_MULTIPLIERS[lang] || 1.0;
  
  const regionData = (REGIONS as any)[region] || REGIONS.europe;
  const hardwareData = (HARDWARE_PROFILES as any)[hardware] || HARDWARE_PROFILES.laptop;

  const baseEnergy = (fileSize / 1024) * ENERGY_MULTIPLIER;
  const adjustedEnergy = baseEnergy * complexity * memPressure * langMultiplier * hardwareData.factor * regionData.factor * (1 + lineCount / 1000);
  
  const gridIntensity = await getGridIntensity(region); 
  const estimatedCO2 = adjustedEnergy * gridIntensity;
  
  return {
    estimatedEnergy: Math.round(adjustedEnergy * 1000) / 1000,
    estimatedCO2: Math.round(estimatedCO2 * 100) / 100,
    energyUnit: 'kWh',
    co2Unit: 'gCO2e',
    gridIntensity,
    lineCount,
    language: lang.toUpperCase(),
    complexity: Math.round(complexity * 100) / 100,
    memPressure: Math.round(memPressure * 100) / 100,
    recursionDetected
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

export function getDeterministicReview(code: string, metrics: any): AIReview {
  const score = Math.max(1, 10 - Math.floor(metrics.complexity * 2));
  return {
    score,
    bottleneck: metrics.complexity > 2 ? "High time complexity detected via structural analysis." : "Standard execution overhead.",
    optimization: metrics.recursionDetected ? "Deep recursion detected. Convert to iterative approach to save stack cycles." : metrics.complexity > 2 ? "Refactor nested logic into O(1) mappings." : "Optimize variable lifecycles.",
    improvement: `${Math.round(metrics.complexity * 5)}% Energy reduction possible.`
  };
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
