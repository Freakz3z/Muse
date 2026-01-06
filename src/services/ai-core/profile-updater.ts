/**
 * AI Profile Updater
 *
 * 核心功能：使用AI分析学习事件，动态更新用户画像
 *
 * 这是Muse AI原生的核心引擎：
 * - 不再使用固定公式（如SM-2）
 * - 而是让AI根据用户的行为模式，实时调整学习策略
 */

import { AILearnerProfile, LearningEvent, ProfileUpdateResult } from '../../types/learner-profile';
import { aiService } from '../ai';

/**
 * 画像更新器
 */
export class ProfileUpdater {
  /**
   * 分析学习事件并更新画像
   *
   * 这是最核心的AI功能：
   * 1. 收集最近的学习事件
   * 2. 用AI分析用户的行为模式
   * 3. 更新画像的各个维度
   */
  async updateProfile(
    currentProfile: AILearnerProfile,
    events: LearningEvent[]
  ): Promise<ProfileUpdateResult> {
    if (events.length === 0) {
      return {
        success: false,
        updatedDimensions: [],
        confidence: 0,
        changes: [],
      };
    }

    console.log(`[ProfileUpdater] Analyzing ${events.length} events...`);

    try {
      // 分析每个维度
      const updates = await Promise.all([
        this.updateCognitiveStyle(currentProfile, events),
        this.updateMemoryPattern(currentProfile, events),
        this.updateBehaviorPattern(currentProfile, events),
        this.updateKnowledgeGraph(currentProfile, events),
        this.updateEmotionalState(currentProfile, events),
      ]);

      // 合并所有更新
      const updatedProfile: AILearnerProfile = {
        ...currentProfile,
        ...updates[0], // cognitiveStyle
        ...updates[1], // memoryPattern
        ...updates[2], // behaviorPattern
        ...updates[3], // knowledgeGraph
        ...updates[4], // emotionalState
        version: currentProfile.version + 1,
        lastUpdated: Date.now(),
      };

      // 收集变更信息
      const changes = this.collectChanges(currentProfile, updatedProfile);

      return {
        success: true,
        updatedDimensions: changes.map(c => c.dimension),
        confidence: this.calculateConfidence(events, changes),
        changes,
      };
    } catch (error) {
      console.error('[ProfileUpdater] Failed to update profile:', error);
      return {
        success: false,
        updatedDimensions: [],
        confidence: 0,
        changes: [],
      };
    }
  }

  /**
   * 更新认知风格维度
   *
   * 分析用户对不同内容类型的反应，推断认知风格
   */
  private async updateCognitiveStyle(
    profile: AILearnerProfile,
    events: LearningEvent[]
  ): Promise<Partial<AILearnerProfile>> {
    // 统计数据
    const visualClues = events.filter(e => e.context?.sessionLength && e.context.sessionLength > 0);
    const correctWithVisual = visualClues.filter(e => e.result === 'correct').length;
    const visualScore = visualClues.length > 0 ? correctWithVisual / visualClues.length : 0.5;

    // 使用AI深入分析
    const prompt = this.buildCognitiveStylePrompt(profile, events);
    const analysis = await this.analyzeWithAI(prompt);

    return {
      cognitiveStyle: {
        visualLearner: this.parseScore(analysis.visualLearner, visualScore),
        verbalLearner: this.parseScore(analysis.verbalLearner, 0.5),
        contextualLearner: this.parseScore(analysis.contextualLearner, 0.5),
        lastUpdated: Date.now(),
      },
    };
  }

  /**
   * 更新记忆特征维度
   *
   * 这是替代SM-2的核心：用AI预测个性化的遗忘曲线
   */
  private async updateMemoryPattern(
    profile: AILearnerProfile,
    events: LearningEvent[]
  ): Promise<Partial<AILearnerProfile>> {
    const prompt = this.buildMemoryPatternPrompt(profile, events);
    const analysis = await this.analyzeWithAI(prompt);

    return {
      memoryPattern: {
        shortTermRetention: this.parseScore(analysis.shortTermRetention, 0.7),
        longTermRetention: this.parseScore(analysis.longTermRetention, 0.5),
        forgettingCurve: analysis.forgettingCurve || [1.0, 0.7, 0.5, 0.35, 0.25],
        optimalReviewInterval: analysis.optimalReviewInterval || 24,
        memoryStability: this.parseScore(analysis.memoryStability, 0.5),
        lastUpdated: Date.now(),
      },
    };
  }

  /**
   * 更新学习行为模式
   */
  private async updateBehaviorPattern(
    profile: AILearnerProfile,
    events: LearningEvent[]
  ): Promise<Partial<AILearnerProfile>> {
    // 统计时段分布
    const timeDistribution = this.analyzeTimeDistribution(events);
    const avgResponseTime = events.reduce((sum, e) => sum + e.timeTaken, 0) / events.length;

    const prompt = this.buildBehaviorPatternPrompt(profile, events, timeDistribution);
    const analysis = await this.analyzeWithAI(prompt);

    return {
      behaviorPattern: {
        preferredStudyTime: analysis.preferredStudyTime || 'evening',
        sessionDuration: analysis.sessionDuration || 30,
        errorPatterns: analysis.errorPatterns || [],
        responseTime: avgResponseTime,
        consistency: this.parseScore(analysis.consistency, 0.5),
        lastUpdated: Date.now(),
      },
    };
  }

  /**
   * 更新知识图谱
   */
  private async updateKnowledgeGraph(
    profile: AILearnerProfile,
    events: LearningEvent[]
  ): Promise<Partial<AILearnerProfile>> {
    const learnedWords = [...new Set(events.map(e => e.word))];
    const recentWords = learnedWords.slice(-20);

    const prompt = this.buildKnowledgeGraphPrompt(profile, events);
    const analysis = await this.analyzeWithAI(prompt);

    // 更新词义关联
    const newAssociations = new Map(profile.knowledgeGraph.wordAssociations);
    for (const event of events) {
      if (!newAssociations.has(event.wordId)) {
        newAssociations.set(event.wordId, []);
      }
    }

    return {
      knowledgeGraph: {
        vocabularySize: profile.knowledgeGraph.vocabularySize + learnedWords.length,
        masteredDomains: analysis.masteredDomains || [],
        weakDomains: analysis.weakDomains || [],
        wordAssociations: newAssociations,
        recentWords,
        lastUpdated: Date.now(),
      },
    };
  }

  /**
   * 更新情感状态
   */
  private async updateEmotionalState(
    profile: AILearnerProfile,
    events: LearningEvent[]
  ): Promise<Partial<AILearnerProfile>> {
    const recentAccuracy = this.calculateRecentAccuracy(events);
    const avgConfidence = events.reduce((sum, e) => sum + e.confidence, 0) / events.length;

    const prompt = this.buildEmotionalStatePrompt(profile, events, recentAccuracy);
    const analysis = await this.analyzeWithAI(prompt);

    return {
      emotionalState: {
        confidence: this.parseScore(analysis.confidence, avgConfidence),
        motivation: this.parseScore(analysis.motivation, 0.8),
        frustration: this.parseScore(analysis.frustration, 0.2),
        flowScore: this.parseScore(analysis.flowScore, 0.5),
        lastUpdated: Date.now(),
      },
    };
  }

  /**
   * 使用AI分析
   *
   * 这里会调用阿里云qwen-max模型
   */
  private async analyzeWithAI(prompt: string): Promise<any> {
    try {
      const response = await aiService.chat([
        {
          role: 'system',
          content: `你是Muse的AI学习分析引擎。你的任务是深度分析用户的学习行为，提取有意义的模式。

你必须：
1. 基于数据做出合理推断
2. 返回有效的JSON格式
3. 数值必须在合理范围内（0-1）
4. 保持客观和准确

只返回JSON，不要其他内容。`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      // 解析JSON响应
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('无法解析AI响应');
    } catch (error) {
      console.error('[ProfileUpdater] AI analysis failed:', error);
      return {};
    }
  }

  // ========== Prompt构建方法 ==========

  private buildCognitiveStylePrompt(profile: AILearnerProfile, events: LearningEvent[]): string {
    const recentEvents = events.slice(-10);
    const eventSummary = recentEvents.map(e =>
      `${e.word}: ${e.result} (confidence: ${e.confidence}, time: ${e.timeTaken}ms)`
    ).join('\n');

    return `分析用户的认知风格，基于以下学习数据：

当前画像：
- 视觉学习倾向: ${profile.cognitiveStyle.visualLearner}
- 语言学习倾向: ${profile.cognitiveStyle.verbalLearner}
- 情境学习倾向: ${profile.cognitiveStyle.contextualLearner}

最近的学习事件：
${eventSummary}

请分析并返回JSON：
{
  "visualLearner": 0-1的数值，表示视觉学习倾向
  "verbalLearner": 0-1的数值，表示语言学习倾向
  "contextualLearner": 0-1的数值，表示情境学习倾向
}

判断依据：
- 反应时间短 -> 可能是视觉或情境学习者
- 信心评分高 -> 找到了适合的学习方式
- 准确率高 -> 认知风格匹配内容类型`;
  }

  private buildMemoryPatternPrompt(profile: AILearnerProfile, events: LearningEvent[]): string {
    const correctRate = events.filter(e => e.result === 'correct').length / events.length;
    const avgConfidence = events.reduce((sum, e) => sum + e.confidence, 0) / events.length;

    return `分析用户的记忆特征，基于以下学习数据：

当前记忆特征：
- 短期记忆保留: ${profile.memoryPattern.shortTermRetention}
- 长期记忆保留: ${profile.memoryPattern.longTermRetention}
- 遗忘曲线: ${profile.memoryPattern.forgettingCurve.join(', ')}

最近表现：
- 正确率: ${(correctRate * 100).toFixed(1)}%
- 平均信心: ${(avgConfidence * 100).toFixed(1)}%
- 学习事件数: ${events.length}

请预测并返回JSON：
{
  "shortTermRetention": 0-1，短期记忆强度
  "longTermRetention": 0-1，长期记忆强度
  "forgettingCurve": [即时, 1天后, 3天后, 1周后, 2周后]的保留率
  "optimalReviewInterval": 最佳复习间隔（小时）
  "memoryStability": 0-1，记忆稳定性
}

考虑：
- 高正确率 -> 记忆力强
- 高信心 -> 记忆稳固
- 反应快 -> 记忆提取容易`;
  }

  private buildBehaviorPatternPrompt(
    profile: AILearnerProfile,
    events: LearningEvent[],
    timeDistribution: Record<string, number>
  ): string {
    const errorPatterns = this.extractErrorPatterns(events);

    return `分析用户的学习行为模式：

当前行为模式：
- 最佳学习时段: ${profile.behaviorPattern.preferredStudyTime}
- 习惯学习时长: ${profile.behaviorPattern.sessionDuration}分钟
- 错误模式: ${profile.behaviorPattern.errorPatterns.join(', ')}

时段分布：
${Object.entries(timeDistribution).map(([time, count]) => `${time}: ${count}次`).join('\n')}

检测到的错误模式：
${errorPatterns.join(', ')}

请分析并返回JSON：
{
  "preferredStudyTime": "morning/afternoon/evening/night"
  "sessionDuration": 习惯学习时长（分钟）
  "errorPatterns": ["拼写错误", "词义混淆", "搭配错误", "发音混淆"]
  "consistency": 0-1，学习一致性
}`;
  }

  private buildKnowledgeGraphPrompt(_profile: AILearnerProfile, events: LearningEvent[]): string {
    const learnedWords = [...new Set(events.map(e => e.word))].slice(0, 20);

    return `分析用户的知识图谱：

最近学习的单词：
${learnedWords.join(', ')}

请推断并返回JSON：
{
  "masteredDomains": ["已掌握的领域，如 business, tech, daily"]
  "weakDomains": ["薄弱领域"]
}`;
  }

  private buildEmotionalStatePrompt(
    _profile: AILearnerProfile,
    events: LearningEvent[],
    recentAccuracy: number
  ): string {
    return `分析用户当前的情感状态：

最近表现：
- 正确率: ${(recentAccuracy * 100).toFixed(1)}%
- 平均信心: ${(events.reduce((sum, e) => sum + e.confidence, 0) / events.length * 100).toFixed(1)}%

请分析并返回JSON：
{
  "confidence": 0-1，学习信心
  "motivation": 0-1，当前动机
  "frustration": 0-1，挫败感
  "flowScore": 0-1，心流状态
}

判断：
- 高正确率 + 高信心 -> 高信心，低挫败感
- 低正确率 + 低信心 -> 需要鼓励
- 稳定表现 -> 可能处于心流状态`;
  }

  // ========== 辅助方法 ==========

  private parseScore(value: any, defaultValue: number): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return Math.max(0, Math.min(1, value));
    }
    return defaultValue;
  }

  private analyzeTimeDistribution(events: LearningEvent[]): Record<string, number> {
    const distribution: Record<string, number> = {
      morning: 0,    // 6-12
      afternoon: 0,  // 12-18
      evening: 0,    // 18-24
      night: 0,      // 0-6
    };

    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      if (hour >= 6 && hour < 12) distribution.morning++;
      else if (hour >= 12 && hour < 18) distribution.afternoon++;
      else if (hour >= 18 && hour < 24) distribution.evening++;
      else distribution.night++;
    }

    return distribution;
  }

  private extractErrorPatterns(events: LearningEvent[]): string[] {
    // 简化版：基于错误类型推断
    const patterns: string[] = [];
    const wrongEvents = events.filter(e => e.result === 'incorrect');

    if (wrongEvents.length > 0) {
      patterns.push('meaning'); // 假设主要是词义错误
    }

    return patterns;
  }

  private calculateRecentAccuracy(events: LearningEvent[]): number {
    if (events.length === 0) return 0;
    return events.filter(e => e.result === 'correct').length / events.length;
  }

  private collectChanges(
    before: AILearnerProfile,
    after: AILearnerProfile
  ): Array<{ dimension: string; before: any; after: any }> {
    const changes = [];

    if (before.cognitiveStyle !== after.cognitiveStyle) {
      changes.push({
        dimension: 'cognitiveStyle',
        before: before.cognitiveStyle,
        after: after.cognitiveStyle,
      });
    }

    if (before.memoryPattern !== after.memoryPattern) {
      changes.push({
        dimension: 'memoryPattern',
        before: before.memoryPattern,
        after: after.memoryPattern,
      });
    }

    return changes;
  }

  private calculateConfidence(events: LearningEvent[], changes: any[]): number {
    // 基于事件数量和变化幅度计算置信度
    const eventFactor = Math.min(events.length / 20, 1); // 最多20个事件达到满分
    const changeFactor = changes.length > 0 ? 0.8 : 0.2;

    return (eventFactor * 0.6 + changeFactor * 0.4);
  }
}

// 单例
let profileUpdaterInstance: ProfileUpdater | null = null;

export const getProfileUpdater = (): ProfileUpdater => {
  if (!profileUpdaterInstance) {
    profileUpdaterInstance = new ProfileUpdater();
  }
  return profileUpdaterInstance;
};
