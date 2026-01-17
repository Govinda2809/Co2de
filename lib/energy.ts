import { AIReview } from './schemas';

const ENERGY_MULTIPLIER = 0.0001;
const CO2_MULTIPLIER = 0.0004;

export function calculateEnergyMetrics(fileSize: number, content?: string) {
  const lineCount = content ? content.split('\n').length : Math.ceil(fileSize / 50);
  const complexity = content ? estimateComplexity(content) : 1;
  
  const baseEnergy = fileSize * ENERGY_MULTIPLIER;
  const adjustedEnergy = baseEnergy * complexity * (1 + lineCount / 1000);
  
  const baseCO2 = fileSize * CO2_MULTIPLIER;
  const adjustedCO2 = baseCO2 * complexity * (1 + lineCount / 1000);
  
  return {
    estimatedEnergy: Math.round(adjustedEnergy * 1000) / 1000,
    estimatedCO2: Math.round(adjustedCO2 * 1000) / 1000,
    energyUnit: 'kWh',
    co2Unit: 'gCO2e',
    lineCount,
    complexity: Math.round(complexity * 100) / 100,
  };
}

function estimateComplexity(content: string): number {
  let complexity = 1;
  
  const loopPatterns = /\b(for|while|do|forEach|map|filter|reduce)\b/g;
  const loops = (content.match(loopPatterns) || []).length;
  complexity += loops * 0.1;
  
  const nestedPatterns = /\{\s*\{|\[\s*\[/g;
  const nested = (content.match(nestedPatterns) || []).length;
  complexity += nested * 0.15;
  
  const recursionPattern = /function\s+(\w+)[^}]*\1\s*\(/g;
  const recursion = (content.match(recursionPattern) || []).length;
  complexity += recursion * 0.2;
  
  const asyncPatterns = /\b(async|await|Promise|fetch|axios)\b/g;
  const asyncOps = (content.match(asyncPatterns) || []).length;
  complexity += asyncOps * 0.05;
  
  return Math.min(complexity, 3);
}

export async function getAIReview(code: string): Promise<AIReview> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) throw new Error('AI review failed');
    
    const data = await response.json();
    return data.review;
  } catch {
    return getMockedReview(code);
  }
}

export function getMockedReview(code: string): AIReview {
  const hasLoops = /\b(for|while|forEach|map)\b/.test(code);
  const hasAsync = /\b(async|await|Promise)\b/.test(code);
  const hasDOM = /\b(document|window|querySelector)\b/.test(code);
  const lineCount = code.split('\n').length;
  
  let score = 7;
  let bottleneck = 'No major energy concerns detected';
  let optimization = 'Code appears reasonably efficient';
  let improvement = '5-10% potential improvement with minor optimizations';
  
  if (hasLoops && lineCount > 50) {
    score = 5;
    bottleneck = 'Multiple loops detected that may cause redundant iterations';
    optimization = 'Consider using more efficient data structures or combining loops';
    improvement = '15-25% reduction in computational overhead';
  }
  
  if (hasAsync) {
    score = Math.min(score, 6);
    bottleneck = 'Async operations may cause unnecessary waiting';
    optimization = 'Batch async operations and use Promise.all for parallel execution';
    improvement = '20-30% reduction in execution time and energy';
  }
  
  if (hasDOM) {
    score = Math.min(score, 5);
    bottleneck = 'DOM manipulation is computationally expensive';
    optimization = 'Minimize DOM queries, cache selectors, use DocumentFragment';
    improvement = '30-40% reduction in browser energy consumption';
  }
  
  if (lineCount > 200) {
    score = Math.max(score - 1, 3);
    bottleneck = 'Large file with potential for modularization';
    optimization = 'Split into smaller modules to enable better tree-shaking';
    improvement = '10-20% reduction through dead code elimination';
  }
  
  return { score, bottleneck, optimization, improvement };
}
