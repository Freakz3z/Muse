// SM-2 间隔重复算法实现
// 基于艾宾浩斯记忆曲线

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
    // 回答质量差，重新开始
    newInterval = 1;
  } else {
    // 计算新间隔
    if (interval === 0) {
      newInterval = 1;
    } else if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEF);
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
 * @param easeFactor 易度因子
 */
export function calculateNextReview(interval: number, easeFactor: number): number {
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
