// SM-2 间隔重复算法实现
// 基于艾宾浩斯记忆曲线

import { adaptiveEngine } from '../services/ai-core';
import type { AdaptiveReviewPlan } from '../services/ai-core/adaptive-learning-engine';
import { getProfileManager } from '../services/ai-core';

/**
 * 计算 SM-2 算法的下次复习参数
 * @param easeFactor 当前易度因子 (EF)
 * @param interval 当前间隔（天）
 * @param quality 回答质量 (0-5)
 *   0 - 完全忘记
 *   1 - 错误，但看到答案后想起来了
 *   2 - 错误，但答案很熟悉
 *   3 - 正确，但有较大困难
 *   4 - 正确，有一点犹豫
 *   5 - 完美回答
 */
export function calculateSM2(
  easeFactor: number,
  interval: number,
  quality: number
): { easeFactor: number; interval: number } {
  // 确保 quality 在 0-5 范围内
  quality = Math.max(0, Math.min(5, quality));
  
  // 计算新的易度因子
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // EF 最小值为 1.3
  newEF = Math.max(1.3, newEF);
  
  let newInterval: number;
  
  if (quality < 3) {
    // 回答质量差，重新开始，但保留一定的 EF 惩罚
    newInterval = 1;
    newEF = Math.max(1.3, easeFactor - 0.2);
  } else {
    // 计算新间隔
    if (interval === 0) {
      newInterval = 1;
    } else if (interval === 1) {
      newInterval = 3; // 从 6 改为 3，让复习更频繁一点
    } else if (interval === 3) {
      newInterval = 7;
    } else {
      newInterval = Math.round(interval * newEF);
    }
    
    // 如果是 "hard" (quality === 3)，额外缩减下一次间隔
    if (quality === 3) {
      newInterval = Math.max(1, Math.round(newInterval * 0.6));
    }
  }
  
  return {
    easeFactor: newEF,
    interval: newInterval,
  };
}

/**
 * 计算下次复习的时间戳
 * @param interval 间隔天数
 */
export function calculateNextReview(interval: number): number {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // 添加一些随机性，避免复习时间过于集中
  const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
  const adjustedInterval = Math.round(interval * randomFactor);
  
  return now + adjustedInterval * msPerDay;
}

/**
 * 根据用户行为转换为 quality 分数
 */
export function getQualityFromResponse(
  responseTime: number, // 响应时间（毫秒）
  correct: boolean,
  hintUsed: boolean = false
): number {
  if (!correct) {
    return hintUsed ? 1 : 0;
  }
  
  // 正确回答，根据响应时间评分
  if (hintUsed) {
    return 3;
  }
  
  if (responseTime < 2000) {
    return 5; // 快速正确回答
  } else if (responseTime < 5000) {
    return 4; // 较快正确回答
  } else {
    return 3; // 有点慢但正确
  }
}

/**
 * 获取今日应复习的单词优先级
 * @param records 学习记录列表
 */
export function getReviewPriority(
  records: Array<{
    wordId: string;
    nextReviewAt: number;
    wrongCount: number;
    correctCount: number;
  }>
): string[] {
  const now = Date.now();
  
  return records
    .filter(r => r.nextReviewAt <= now)
    .sort((a, b) => {
      // 优先复习错误率高的单词
      const aErrorRate = a.wrongCount / (a.correctCount + a.wrongCount || 1);
      const bErrorRate = b.wrongCount / (b.correctCount + b.wrongCount || 1);
      
      if (Math.abs(aErrorRate - bErrorRate) > 0.2) {
        return bErrorRate - aErrorRate;
      }
      
      // 其次按时间排序
      return a.nextReviewAt - b.nextReviewAt;
    })
    .map(r => r.wordId);
}

/**
 * 计算遗忘曲线上的记忆保持率
 * @param daysSinceReview 距上次复习的天数
 * @param easeFactor 易度因子
 */
export function calculateRetention(daysSinceReview: number, easeFactor: number): number {
  // 使用指数衰减模型
  const stability = easeFactor * 2; // 稳定性与易度因子相关
  const retention = Math.exp(-daysSinceReview / stability);
  return Math.max(0, Math.min(1, retention));
}

/**
 * 获取推荐的每日新词数量
 * @param reviewCount 今日待复习数量
 * @param dailyGoal 每日目标
 */
export function getRecommendedNewWords(reviewCount: number, dailyGoal: number): number {
  // 复习优先，剩余配额给新词
  const reviewWeight = 0.7; // 复习权重
  const effectiveReviewCount = Math.round(reviewCount * reviewWeight);
  const remaining = Math.max(0, dailyGoal - effectiveReviewCount);
  return remaining;
}

// ==================== AI自适应学习引擎集成 ====================

/**
 * 配置AI自适应引擎
 */
export interface AdaptiveConfig {
  enableAI: boolean;          // 是否启用AI预测
  fallbackToSM2: boolean;      // AI失败时回退到SM-2
  minInterval: number;         // 最小复习间隔（小时）
  maxInterval: number;         // 最大复习间隔（小时）
}

const DEFAULT_ADAPTIVE_CONFIG: AdaptiveConfig = {
  enableAI: true,
  fallbackToSM2: true,
  minInterval: 1,      // 1小时
  maxInterval: 720,    // 30天
};

let adaptiveConfig: AdaptiveConfig = { ...DEFAULT_ADAPTIVE_CONFIG };

/**
 * 更新AI自适应引擎配置
 */
export function updateAdaptiveConfig(config: Partial<AdaptiveConfig>) {
  adaptiveConfig = { ...adaptiveConfig, ...config };
  adaptiveEngine.updateConfig({
    enableAIPrediction: adaptiveConfig.enableAI,
    fallbackToSM2: adaptiveConfig.fallbackToSM2,
    minInterval: adaptiveConfig.minInterval,
    maxInterval: adaptiveConfig.maxInterval
  });
}

/**
 * 获取当前配置
 */
export function getAdaptiveConfig(): AdaptiveConfig {
  return { ...adaptiveConfig };
}

/**
 * 使用AI自适应引擎计算下次复习时间
 *
 * 这是替代SM-2算法的核心函数
 *
 * @param wordId 单词ID
 * @param wordHistory 该单词的学习历史
 * @returns 个性化复习计划
 */
export async function calculateAdaptiveNextReview(
  wordId: string,
  wordHistory: Array<{
    action: 'learn' | 'review' | 'quiz';
    result: 'correct' | 'incorrect' | 'partial';
    timestamp: number;
    timeTaken: number;
    confidence: number;
  }>
): Promise<AdaptiveReviewPlan> {
  // 如果未启用AI，回退到SM-2
  if (!adaptiveConfig.enableAI) {
    return convertSM2ToAdaptive(wordId, wordHistory);
  }

  try {
    // 获取用户画像
    const profileManager = getProfileManager();
    const profile = profileManager.getProfile();

    if (!profile) {
      // 没有画像数据，回退到SM-2
      return convertSM2ToAdaptive(wordId, wordHistory);
    }

    // 转换历史数据格式
    const learningEvents = convertHistoryToEvents(wordId, wordHistory);

    // 使用AI自适应引擎预测
    return await adaptiveEngine.calculateNextReview(wordId, profile, learningEvents);
  } catch (error) {
    console.error('AI自适应预测失败:', error);
    if (adaptiveConfig.fallbackToSM2) {
      return convertSM2ToAdaptive(wordId, wordHistory);
    }
    throw error;
  }
}

/**
 * 批量计算多个单词的复习计划（更高效）
 */
export async function calculateAdaptiveBatch(
  items: Array<{
    wordId: string;
    history: Array<{
      action: 'learn' | 'review' | 'quiz';
      result: 'correct' | 'incorrect' | 'partial';
      timestamp: number;
      timeTaken: number;
      confidence: number;
    }>;
  }>
): Promise<AdaptiveReviewPlan[]> {
  if (!adaptiveConfig.enableAI) {
    return items.map(item => convertSM2ToAdaptive(item.wordId, item.history));
  }

  try {
    const profileManager = getProfileManager();
    const profile = profileManager.getProfile();

    if (!profile) {
      return items.map(item => convertSM2ToAdaptive(item.wordId, item.history));
    }

    const convertedItems = items.map(item => ({
      wordId: item.wordId,
      history: convertHistoryToEvents(item.wordId, item.history)
    }));

    return await adaptiveEngine.calculateBatch(convertedItems, profile);
  } catch (error) {
    console.error('批量AI预测失败:', error);
    return items.map(item => convertSM2ToAdaptive(item.wordId, item.history));
  }
}

/**
 * 转换历史数据格式为LearningEvent
 */
function convertHistoryToEvents(
  wordId: string,
  history: Array<{
    action: 'learn' | 'review' | 'quiz';
    result: 'correct' | 'incorrect' | 'partial';
    timestamp: number;
    timeTaken: number;
    confidence: number;
  }>
) {
  return history.map(h => ({
    wordId,
    word: '',  // AI不需要word字段，可以从wordId推断
    timestamp: h.timestamp,
    action: h.action,
    result: h.result,
    confidence: h.confidence,
    timeTaken: h.timeTaken,
    context: {
      sessionLength: history.length,  // 简化：使用总历史长度
      timeOfDay: getCurrentTimeOfDay()
    }
  }));
}

/**
 * 将SM-2算法转换为AdaptiveReviewPlan格式
 * 用于AI未启用或失败时的回退
 */
function convertSM2ToAdaptive(
  wordId: string,
  history: Array<{
    action: 'learn' | 'review' | 'quiz';
    result: 'correct' | 'incorrect' | 'partial';
    timestamp: number;
    timeTaken: number;
    confidence: number;
  }>
): AdaptiveReviewPlan {
  const correctCount = history.filter(h => h.result === 'correct').length;

  // 简化版SM-2逻辑
  let interval = 24; // 默认1天

  if (correctCount >= 3) {
    interval = 24 * Math.pow(2, correctCount - 2);
  } else if (correctCount === 0) {
    interval = 4; // 4小时后复习
  }

  // 限制范围
  interval = Math.max(
    adaptiveConfig.minInterval,
    Math.min(adaptiveConfig.maxInterval, interval)
  );

  const nextReviewAt = Date.now() + (interval * 60 * 60 * 1000);

  return {
    wordId,
    nextReviewAt,
    interval: Math.round(interval),
    confidence: 0.6,
    reasoning: '使用SM-2算法（AI未启用）',
    difficulty: correctCount >= 3 ? 'easy' : correctCount >= 1 ? 'medium' : 'hard',
    suggestedAction: '建议按计划复习'
  };
}

/**
 * 获取当前时段（辅助函数）
 */
function getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}

/**
 * 判断是否应该使用AI自适应引擎
 */
export function shouldUseAI(): boolean {
  return adaptiveConfig.enableAI;
}

/**
 * 切换AI自适应引擎开关
 */
export function toggleAI(enable?: boolean): boolean {
  const newState = enable !== undefined ? enable : !adaptiveConfig.enableAI;
  updateAdaptiveConfig({ enableAI: newState });
  return newState;
}
