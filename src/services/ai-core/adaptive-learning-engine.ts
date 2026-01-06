/**
 * 自适应学习引擎 - AdaptiveLearningEngine
 *
 * 用AI预测替代传统的SM-2算法，实现个性化复习间隔计算
 *
 * 核心优势：
 * 1. 考虑用户的个性化遗忘曲线（而非固定公式）
 * 2. 考虑学习时段、情感状态、认知风格等因素
 * 3. 动态调整，越学越准确
 * 4. 基于AI的深度学习预测
 */

import { AILearnerProfile, LearningEvent } from '../../types/learner-profile';
import { aiService } from '../ai';

export interface AdaptiveReviewPlan {
  wordId: string;
  nextReviewAt: number;  // 下次复习时间戳
  interval: number;      // 复习间隔（小时）
  confidence: number;    // 预测置信度 0-1
  reasoning: string;     // AI推理过程
  difficulty: 'easy' | 'medium' | 'hard';  // 个性化难度评级
  suggestedAction: string;  // 建议的学习行动
}

export interface AdaptiveEngineConfig {
  enableAIPrediction: boolean;  // 是否启用AI预测
  fallbackToSM2: boolean;       // AI失败时是否回退到SM-2
  minInterval: number;          // 最小复习间隔（小时）
  maxInterval: number;          // 最大复习间隔（小时）
}

const DEFAULT_CONFIG: AdaptiveEngineConfig = {
  enableAIPrediction: true,
  fallbackToSM2: true,
  minInterval: 1,      // 1小时
  maxInterval: 720,    // 30天
};

export class AdaptiveLearningEngine {
  private config: AdaptiveEngineConfig;

  constructor(config: Partial<AdaptiveEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 核心方法：计算下次复习时间
   *
   * @param wordId - 单词ID
   * @param profile - 用户AI画像
   * @param wordHistory - 该单词的学习历史
   * @returns 个性化复习计划
   */
  async calculateNextReview(
    wordId: string,
    profile: AILearnerProfile | null,
    wordHistory: LearningEvent[]
  ): Promise<AdaptiveReviewPlan> {
    // 如果没有配置AI或没有画像数据，回退到SM-2
    if (!this.config.enableAIPrediction || !profile) {
      return this.fallbackToSM2(wordId, wordHistory);
    }

    try {
      // 使用AI预测个性化复习间隔
      return await this.predictWithAI(wordId, profile, wordHistory);
    } catch (error) {
      console.error('AI预测失败，回退到SM-2算法:', error);
      if (this.config.fallbackToSM2) {
        return this.fallbackToSM2(wordId, wordHistory);
      }
      throw error;
    }
  }

  /**
   * 使用AI预测个性化复习间隔
   */
  private async predictWithAI(
    wordId: string,
    profile: AILearnerProfile,
    wordHistory: LearningEvent[]
  ): Promise<AdaptiveReviewPlan> {
    // 分析该单词的学习历史
    const historyAnalysis = this.analyzeWordHistory(wordHistory);

    // 构建AI提示词
    const prompt = this.buildPredictionPrompt(profile, wordHistory, historyAnalysis);

    // 调用AI分析
    const response = await aiService.chat([
      {
        role: 'system',
        content: `你是一个专业的记忆科学专家，精通艾宾浩斯遗忘曲线和个性化学习算法。
请根据用户的学习数据和个性化特征，预测最佳的复习时间。

你必须严格按照以下JSON格式返回：
{
  "interval": 复习间隔（小时，整数）,
  "confidence": 预测置信度（0-1之间的小数）,
  "difficulty": "easy" | "medium" | "hard",
  "reasoning": "简短解释为什么选择这个间隔（50字以内）",
  "suggestedAction": "针对这个单词的个性化学习建议（30字以内）"
}

考虑因素：
1. 用户的记忆特征（遗忘曲线斜率）
2. 用户对该单词的表现（正确率、反应时间）
3. 用户的认知风格（视觉/语言/情境学习偏好）
4. 用户的学习时段偏好
5. 当前情感状态（信心、动机水平）

输出要求：
- interval范围：${this.config.minInterval}到${this.config.maxInterval}小时
- 正确率高的单词：给予更长的间隔
- 正确率低的单词：缩短复习间隔
- 反应时间快：表明记忆牢固，可以延长间隔
- 反应时间慢：表明记忆模糊，需要加强复习
- 只返回JSON，不要其他内容`
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析AI响应
    const prediction = this.parsePrediction(response.content);

    // 计算下次复习时间
    const nextReviewAt = Date.now() + (prediction.interval * 60 * 60 * 1000);

    return {
      wordId,
      nextReviewAt,
      interval: prediction.interval,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      difficulty: prediction.difficulty,
      suggestedAction: prediction.suggestedAction
    };
  }

  /**
   * 构建AI预测提示词（优化版 - 添加动态决策框架）
   */
  private buildPredictionPrompt(
    profile: AILearnerProfile,
    _wordHistory: LearningEvent[],
    historyAnalysis: ReturnType<typeof AdaptiveLearningEngine.prototype.analyzeWordHistory>
  ): string {
    // 记忆特征
    const memory = profile.memoryPattern;
    // 行为模式
    const behavior = profile.behaviorPattern;
    // 情感状态
    const emotional = profile.emotionalState;

    // 动态时间范围指导
    const intervalGuidance = this.getIntervalGuidance(historyAnalysis);

    return `## 决策任务
预测以下单词的最佳复习间隔（小时）

## 用户画像
**记忆特征**
- 遗忘曲线: [${memory.forgettingCurve.map(v => v.toFixed(2)).join(', ')}]
- 最佳复习间隔: ${memory.optimalReviewInterval}小时
- 短期记忆保留: ${(memory.shortTermRetention * 100).toFixed(0)}%
- 长期记忆保留: ${(memory.longTermRetention * 100).toFixed(0)}%

**学习行为**
- 最佳时段: ${behavior.preferredStudyTime}
- 习惯时长: ${behavior.sessionDuration}分钟
- 学习一致性: ${(behavior.consistency * 100).toFixed(0)}%

**情感状态**
- 学习信心: ${(emotional.confidence * 100).toFixed(0)}%
- 当前动机: ${(emotional.motivation * 100).toFixed(0)}%

## 单词学习历史
- 学习次数: ${historyAnalysis.totalAttempts}次
- 正确率: ${(historyAnalysis.correctRate * 100).toFixed(1)}%
- 平均反应: ${historyAnalysis.avgResponseTime}ms
- 最近表现: ${historyAnalysis.recentPerformance}
- 上次结果: ${historyAnalysis.lastResult}

${intervalGuidance}

## 决策优先级
1. **反应时间权重**: <1500ms×1.5, 1500-2500ms×1.2, 2500-4000ms×1.0, >4000ms×0.7
2. **正确率调整**: <80%缩短, >90%延长
3. **情感考虑**: 信心低时避免挑战
4. **特殊情况**: 连续错误用2-6小时

## 输出要求
严格按照以下JSON格式返回（不要包含markdown代码块标记）：
{
  "interval": 复习间隔（小时，整数）,
  "confidence": 预测置信度（0-1之间的小数）,
  "difficulty": "easy" | "medium" | "hard",
  "reasoning": "简短解释决策过程（50字以内）",
  "suggestedAction": "个性化学习建议（30字以内）}`;
  }

  /**
   * 获取时间范围指导（新增）
   */
  private getIntervalGuidance(historyAnalysis: ReturnType<typeof AdaptiveLearningEngine.prototype.analyzeWordHistory>): string {
    const { totalAttempts, correctRate, avgResponseTime } = historyAnalysis;

    let baseInterval = 24;
    let guidance = '## 时间范围指导\n';

    if (totalAttempts === 1) {
      baseInterval = 4;
      guidance += `- 首次学习 → 推荐4小时（2-12小时范围）\n`;
    } else if (totalAttempts <= 3) {
      if (correctRate >= 0.8) {
        baseInterval = 24;
        guidance += `- 早期学习+正确率高 → 推荐24小时（12-48小时范围）\n`;
      } else {
        baseInterval = 4;
        guidance += `- 早期学习+正确率低 → 推荐4小时（2-12小时范围）\n`;
      }
    } else if (totalAttempts <= 10) {
      if (correctRate >= 0.9) {
        baseInterval = 120;
        guidance += `- 中期学习+掌握良好 → 推荐120小时/5天（3-7天范围）\n`;
      } else {
        baseInterval = 24;
        guidance += `- 中期学习+掌握不足 → 推荐24小时（12-48小时范围）\n`;
      }
    } else {
      if (correctRate >= 0.95) {
        baseInterval = 336;
        guidance += `- 长期记忆+掌握优秀 → 推荐336小时/14天（7-30天范围）\n`;
      } else {
        baseInterval = 48;
        guidance += `- 长期记忆+掌握一般 → 推荐48小时/2天（1-5天范围）\n`;
      }
    }

    // 反应时间调整
    const timeAdjustment = avgResponseTime < 1500 ? '×1.5 (延长50%)' :
                          avgResponseTime < 2500 ? '×1.2 (延长20%)' :
                          avgResponseTime < 4000 ? '×1.0 (不变)' : '×0.7 (缩短30%)';

    guidance += `\n**基础间隔**: ${baseInterval}小时\n`;
    guidance += `**反应时间调整**: ${avgResponseTime}ms → ${timeAdjustment}`;

    return guidance;
  }

  /**
   * 分析单词学习历史
   */
  private analyzeWordHistory(history: LearningEvent[]) {
    if (history.length === 0) {
      return {
        totalAttempts: 0,
        correctRate: 0,
        avgResponseTime: 0,
        recentPerformance: '首次学习',
        lastAction: 'none',
        lastResult: 'none',
        timeSinceLastEvent: Infinity
      };
    }

    const recentEvents = history.slice(-5); // 最近5次
    const correctCount = history.filter(e => e.result === 'correct').length;
    const avgResponseTime = history.reduce((sum, e) => sum + e.timeTaken, 0) / history.length;
    const recentCorrectCount = recentEvents.filter(e => e.result === 'correct').length;
    const lastEvent = history[history.length - 1];

    // 最近表现评估
    let recentPerformance = '一般';
    if (recentCorrectCount === 5) recentPerformance = '优秀';
    else if (recentCorrectCount >= 3) recentPerformance = '良好';
    else if (recentCorrectCount <= 1) recentPerformance = '较弱';

    // 距离上次学习的小时数
    const timeSinceLastEvent = (Date.now() - lastEvent.timestamp) / (1000 * 60 * 60);

    return {
      totalAttempts: history.length,
      correctRate: correctCount / history.length,
      avgResponseTime: Math.round(avgResponseTime),
      recentPerformance,
      lastAction: lastEvent.action,
      lastResult: lastEvent.result,
      timeSinceLastEvent
    };
  }

  /**
   * 解析AI预测响应
   */
  private parsePrediction(content: string): {
    interval: number;
    confidence: number;
    difficulty: 'easy' | 'medium' | 'hard';
    reasoning: string;
    suggestedAction: string;
  } {
    try {
      // 清理响应内容
      let jsonStr = content.trim();
      // 移除markdown代码块标记
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // 提取JSON对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 验证并调整interval在合理范围内
        let interval = Math.max(
          this.config.minInterval,
          Math.min(this.config.maxInterval, parsed.interval || 24)
        );

        return {
          interval,
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.7)),
          difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty)
            ? parsed.difficulty
            : 'medium',
          reasoning: parsed.reasoning || '基于AI个性化预测',
          suggestedAction: parsed.suggestedAction || '按时复习巩固记忆'
        };
      }
    } catch (error) {
      console.error('解析AI预测失败:', error);
    }

    // 返回默认值
    return {
      interval: 24,
      confidence: 0.5,
      difficulty: 'medium',
      reasoning: '使用默认复习间隔',
      suggestedAction: '建议按时复习'
    };
  }

  /**
   * 回退到SM-2算法
   */
  private fallbackToSM2(
    wordId: string,
    history: LearningEvent[]
  ): AdaptiveReviewPlan {
    // 简化版SM-2算法
    const correctCount = history.filter(e => e.result === 'correct').length;
    const incorrectCount = history.filter(e => e.result === 'incorrect').length;

    // 基础间隔（小时）
    let interval = 24; // 默认1天

    if (correctCount >= 3) {
      interval = 24 * Math.pow(2, correctCount - 2); // 2的幂次增长
    } else if (incorrectCount > 0) {
      interval = 12; // 错误后缩短为半天
    }

    // 限制在合理范围内
    interval = Math.max(this.config.minInterval, Math.min(this.config.maxInterval, interval));

    const nextReviewAt = Date.now() + (interval * 60 * 60 * 1000);

    return {
      wordId,
      nextReviewAt,
      interval: Math.round(interval),
      confidence: 0.6, // SM-2算法的置信度较低
      reasoning: '使用传统SM-2算法（AI未配置或失败）',
      difficulty: correctCount >= 3 ? 'easy' : correctCount >= 1 ? 'medium' : 'hard',
      suggestedAction: '建议按计划复习'
    };
  }

  /**
   * 批量计算多个单词的复习计划
   */
  async calculateBatch(
    items: Array<{ wordId: string; history: LearningEvent[] }>,
    profile: AILearnerProfile | null
  ): Promise<AdaptiveReviewPlan[]> {
    // 如果没有AI，逐个使用SM-2
    if (!this.config.enableAIPrediction || !profile) {
      return items.map(item =>
        this.fallbackToSM2(item.wordId, item.history)
      );
    }

    // 使用AI批量预测（提示词包含多个单词）
    try {
      return await this.predictBatchWithAI(items, profile);
    } catch (error) {
      console.error('批量AI预测失败，回退到逐个预测:', error);
      // 降级到逐个预测
      const results: AdaptiveReviewPlan[] = [];
      for (const item of items) {
        const plan = await this.calculateNextReview(item.wordId, profile, item.history);
        results.push(plan);
      }
      return results;
    }
  }

  /**
   * 批量AI预测（更高效）
   */
  private async predictBatchWithAI(
    items: Array<{ wordId: string; history: LearningEvent[] }>,
    profile: AILearnerProfile
  ): Promise<AdaptiveReviewPlan[]> {
    // 为每个单词构建简要信息
    const wordsSummary = items.map(item => {
      const analysis = this.analyzeWordHistory(item.history);
      return {
        wordId: item.wordId,
        attempts: analysis.totalAttempts,
        correctRate: (analysis.correctRate * 100).toFixed(1) + '%',
        avgTime: analysis.avgResponseTime + 'ms',
        recent: analysis.recentPerformance
      };
    });

    const prompt = `批量预测以下${items.length}个单词的最佳复习间隔（小时）：

**用户画像：**
- 最佳复习间隔：${profile.memoryPattern.optimalReviewInterval}小时
- 记忆稳定性：${profile.memoryPattern.memoryStability.toFixed(2)}
- 学习时段：${profile.behaviorPattern.preferredStudyTime}

**单词列表：**
${wordsSummary.map((w, i) => `${i + 1}. ${w.wordId}: ${w.attempts}次学习, 正确率${w.correctRate}, ${w.recent}`).join('\n')}

请为每个单词预测最佳复习间隔，返回JSON数组格式：
[
  {
    "wordId": "单词ID",
    "interval": 复习间隔（小时）,
    "difficulty": "easy" | "medium" | "hard"
  }
]

只返回JSON数组，不要其他内容。`;

    const response = await aiService.chat([
      {
        role: 'system',
        content: `你是记忆科学专家。批量预测复习间隔，返回JSON数组格式。`
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    return this.parseBatchPrediction(response.content, items);
  }

  /**
   * 解析批量预测响应
   */
  private parseBatchPrediction(
    content: string,
    items: Array<{ wordId: string; history: LearningEvent[] }>
  ): AdaptiveReviewPlan[] {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const predictions = JSON.parse(jsonMatch[0]);

        return predictions.map((pred: any, index: number) => {
          const wordId = items[index].wordId;
          const interval = Math.max(
            this.config.minInterval,
            Math.min(this.config.maxInterval, Math.round(pred.interval) || 24)
          );

          return {
            wordId,
            nextReviewAt: Date.now() + (interval * 60 * 60 * 1000),
            interval,
            confidence: 0.7,
            reasoning: 'AI批量预测',
            suggestedAction: '建议按时复习',
            difficulty: pred.difficulty || 'medium'
          };
        });
      }
    } catch (error) {
      console.error('解析批量预测失败:', error);
    }

    // 解析失败，返回默认计划
    return items.map(item => this.fallbackToSM2(item.wordId, item.history));
  }

  /**
   * 更新引擎配置
   */
  updateConfig(config: Partial<AdaptiveEngineConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AdaptiveEngineConfig {
    return { ...this.config };
  }
}

// 导出单例
export const adaptiveEngine = new AdaptiveLearningEngine();
