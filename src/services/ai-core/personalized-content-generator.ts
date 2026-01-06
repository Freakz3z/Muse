/**
 * 个性化内容生成器 - PersonalizedContentGenerator
 *
 * 根据用户画像生成个性化的学习内容:
 * 1. 动态例句生成
 * 2. 记忆技巧生成
 * 3. 释义难度适配
 *
 * 核心优势:
 * - 根据认知风格生成内容
 * - 基于词汇量调整难度
 * - 提供个性化学习建议
 */

import { aiService } from '../ai';
import type {
  ContentGenerationRequest,
  GeneratedExample,
  GeneratedMemoryTip,
  GeneratedExplanation,
  BatchContentRequest,
  ContentGeneratorConfig,
  ContentCacheItem,
  ContentGeneratorState
} from '../../types/personalized-content';
import type { CognitiveStyle } from '../../types/learner-profile';

const DEFAULT_CONFIG: ContentGeneratorConfig = {
  enableExamples: true,
  enableMemoryTips: true,
  enableAdaptiveDifficulty: true,
  maxExamples: 3,
  cacheEnabled: true,
  cacheTTL: 3600, // 1小时
};

/**
 * 个性化内容生成器
 */
export class PersonalizedContentGenerator {
  private config: ContentGeneratorConfig;
  private cache: Map<string, ContentCacheItem>;
  private state: ContentGeneratorState;

  constructor(config: Partial<ContentGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
    this.state = {
      totalGenerated: 0,
      cacheHitRate: 0,
      averageGenerationTime: 0,
      lastGeneratedAt: 0,
    };
  }

  /**
   * 生成例句
   */
  async generateExample(request: ContentGenerationRequest): Promise<GeneratedExample> {
    const cacheKey = this.getCacheKey('example', request.wordId, request.word);

    // 检查缓存
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      cached.hitCount++;
      return cached.content as GeneratedExample;
    }

    const startTime = Date.now();

    // 根据认知风格选择生成策略
    const style = this.determineContentStyle(request.profile.cognitiveStyle);

    // 构建AI提示词
    const prompt = this.buildExamplePrompt(request, style);

    // 调用AI生成
    const response = await aiService.chat([
      {
        role: 'system',
        content: this.getExampleSystemPrompt(style)
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析响应
    const example = this.parseExample(response.content, style);

    // 缓存结果
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        content: example,
        timestamp: Date.now(),
        hitCount: 0
      });
    }

    // 更新状态
    this.updateState(Date.now() - startTime);

    return example;
  }

  /**
   * 生成记忆技巧
   */
  async generateMemoryTip(request: ContentGenerationRequest): Promise<GeneratedMemoryTip> {
    const cacheKey = this.getCacheKey('memoryTip', request.wordId, request.word);

    // 检查缓存
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      cached.hitCount++;
      return cached.content as GeneratedMemoryTip;
    }

    const startTime = Date.now();

    // 根据用户特征选择最佳技巧类型
    const technique = this.selectBestTechnique(request);

    // 构建AI提示词
    const prompt = this.buildMemoryTipPrompt(request, technique);

    // 调用AI生成
    const response = await aiService.chat([
      {
        role: 'system',
        content: this.getMemoryTipSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析响应
    const memoryTip = this.parseMemoryTip(response.content);

    // 缓存结果
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        content: memoryTip,
        timestamp: Date.now(),
        hitCount: 0
      });
    }

    // 更新状态
    this.updateState(Date.now() - startTime);

    return memoryTip;
  }

  /**
   * 生成释义
   */
  async generateExplanation(request: ContentGenerationRequest): Promise<GeneratedExplanation> {
    const cacheKey = this.getCacheKey('explanation', request.wordId, request.word);

    // 检查缓存
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      cached.hitCount++;
      return cached.content as GeneratedExplanation;
    }

    const startTime = Date.now();

    // 根据词汇量确定难度级别
    const difficulty = this.determineDifficulty(request);

    // 构建AI提示词
    const prompt = this.buildExplanationPrompt(request, difficulty);

    // 调用AI生成
    const response = await aiService.chat([
      {
        role: 'system',
        content: this.getExplanationSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    // 解析响应
    const explanation = this.parseExplanation(response.content);

    // 缓存结果
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, {
        content: explanation,
        timestamp: Date.now(),
        hitCount: 0
      });
    }

    // 更新状态
    this.updateState(Date.now() - startTime);

    return explanation;
  }

  /**
   * 批量生成内容
   */
  async generateBatch(batchRequest: BatchContentRequest): Promise<Map<string, GeneratedExample | GeneratedMemoryTip | GeneratedExplanation>> {
    const results = new Map();

    for (const wordData of batchRequest.words) {
      for (const contentType of batchRequest.contentTypes) {
        const request: ContentGenerationRequest = {
          ...wordData,
          profile: batchRequest.profile,
          contentType
        };

        let content;
        switch (contentType) {
          case 'example':
            content = await this.generateExample(request);
            break;
          case 'memoryTip':
            content = await this.generateMemoryTip(request);
            break;
          case 'explanation':
            content = await this.generateExplanation(request);
            break;
        }

        results.set(`${wordData.wordId}_${contentType}`, content);
      }
    }

    return results;
  }

  /**
   * 确定内容风格(基于认知风格)
   */
  private determineContentStyle(cognitiveStyle: CognitiveStyle): 'visual' | 'linguistic' | 'contextual' {
    const { visualLearner, verbalLearner, contextualLearner } = cognitiveStyle;

    if (visualLearner > verbalLearner && visualLearner > contextualLearner) {
      return 'visual';
    } else if (verbalLearner > contextualLearner) {
      return 'linguistic';
    } else {
      return 'contextual';
    }
  }

  /**
   * 选择最佳记忆技巧
   */
  private selectBestTechnique(request: ContentGenerationRequest): GeneratedMemoryTip['technique'] {
    const { cognitiveStyle } = request.profile;

    // 视觉型学习者: 优先使用联想和场景记忆
    if (cognitiveStyle.visualLearner > 0.7) {
      return Math.random() > 0.5 ? 'association' : 'scene';
    }

    // 语言型学习者: 优先使用词根词缀
    if (cognitiveStyle.verbalLearner > 0.7) {
      return 'wordRoot';
    }

    // 情境型学习者: 优先使用场景和故事
    if (cognitiveStyle.contextualLearner > 0.7) {
      return Math.random() > 0.5 ? 'scene' : 'story';
    }

    // 默认随机选择
    const techniques: GeneratedMemoryTip['technique'][] = ['association', 'wordRoot', 'scene', 'story', 'mnemonic'];
    return techniques[Math.floor(Math.random() * techniques.length)];
  }

  /**
   * 确定难度级别(基于词汇量)
   */
  private determineDifficulty(request: ContentGenerationRequest): 'beginner' | 'intermediate' | 'advanced' {
    // 基于词汇量大小估算难度
    const vocabSize = request.profile.knowledgeGraph.vocabularySize;

    if (vocabSize < 500) {
      return 'beginner';
    } else if (vocabSize < 2000) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * 构建例句生成提示词
   */
  private buildExamplePrompt(request: ContentGenerationRequest, style: 'visual' | 'linguistic' | 'contextual'): string {
    const { word, definition } = request;

    let styleGuidance = '';
    switch (style) {
      case 'visual':
        styleGuidance = '例句应包含生动的场景描述,便于在脑海中形成画面';
        break;
      case 'linguistic':
        styleGuidance = '例句应展示词汇的语法用法和搭配';
        break;
      case 'contextual':
        styleGuidance = '例句应提供真实的使用场景和上下文';
        break;
    }

    return `为单词生成例句:

**单词**: ${word}
**释义**: ${definition}
**风格要求**: ${styleGuidance}

请生成一个英语例句,要求:
1. 句子自然地道
2. 展示单词的实际用法
3. 难度适中
4. ${styleGuidance}

严格按照以下JSON格式返回:
{
  "sentence": "英语例句",
  "translation": "中文翻译",
  "scenario": "使用场景描述",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "style": "visual" | "linguistic" | "contextual"
}`;
  }

  /**
   * 构建记忆技巧提示词
   */
  private buildMemoryTipPrompt(request: ContentGenerationRequest, technique: GeneratedMemoryTip['technique']): string {
    const { word, definition, profile } = request;
    const techniqueNames = {
      association: '联想记忆法',
      wordRoot: '词根词缀法',
      scene: '场景记忆法',
      story: '故事记忆法',
      mnemonic: '助记符法'
    };

    return `为单词生成记忆技巧:

**单词**: ${word}
**释义**: ${definition}
**用户词汇量**: ${profile.knowledgeGraph.vocabularySize}词
**技巧类型**: ${techniqueNames[technique]}

请基于${techniqueNames[technique]}生成记忆技巧,帮助用户快速记住这个单词。

严格按照以下JSON格式返回:
{
  "technique": "${technique}",
  "title": "技巧标题(简短)",
  "content": "详细的记忆技巧说明",
  "effectiveness": 0.8,
  "estimatedTime": 5
}`;
  }

  /**
   * 构建释义提示词
   */
  private buildExplanationPrompt(request: ContentGenerationRequest, difficulty: 'beginner' | 'intermediate' | 'advanced'): string {
    const { word, definition } = request;
    const difficultyGuidance = {
      beginner: '使用简单的中文释义,避免复杂的英语术语',
      intermediate: '使用简单的英语释义+中文辅助',
      advanced: '使用纯英语释义,包含同义词和反义词'
    };

    return `为单词生成分级释义:

**单词**: ${word}
**原始释义**: ${definition}
**难度级别**: ${difficulty}
**要求**: ${difficultyGuidance[difficulty]}

请生成适合该难度的释义内容,包括:
1. 解释说明
2. 同义词(2-3个)
3. 反义词(1-2个)
4. 常用搭配(2-3个)

严格按照以下JSON格式返回:
{
  "definition": "释义内容",
  "difficulty": "${difficulty}",
  "synonyms": ["同义词1", "同义词2"],
  "antonyms": ["反义词1"],
  "collocations": ["搭配1", "搭配2"]
}`;
  }

  /**
   * 获取例句系统提示词
   */
  private getExampleSystemPrompt(style: 'visual' | 'linguistic' | 'contextual'): string {
    return `你是一个专业的英语教学专家,擅长创作${style === 'visual' ? '生动形象' : style === 'linguistic' ? '语法精准' : '情境真实'}的英语例句。

你的任务是根据单词和学习者的认知风格,生成个性化的例句。

要求:
1. 例句必须自然地道,符合英语母语者的使用习惯
2. 例句难度要适中,既不太简单也不太复杂
3. 例句要能帮助学习者理解单词的实际用法
4. ${style === 'visual' ? '例句应包含生动的场景描述,便于在脑海中形成画面' : ''}
  ${style === 'linguistic' ? '例句应展示词汇的语法用法和搭配' : ''}
  ${style === 'contextual' ? '例句应提供真实的使用场景和上下文' : ''}

输出格式: 严格按照JSON格式返回,不要包含其他内容。`;
  }

  /**
   * 获取记忆技巧系统提示词
   */
  private getMemoryTipSystemPrompt(): string {
    return `你是一个记忆科学专家,精通各种记忆技巧和方法。

你的任务是为英语单词生成有效的记忆技巧,帮助学习者快速掌握词汇。

技巧类型:
1. **联想记忆法**: 通过图像、声音、意义等建立联系
2. **词根词缀法**: 分析词根、前缀、后缀的含义
3. **场景记忆法**: 将单词放入具体场景中记忆
4. **故事记忆法**: 用故事情节串联单词
5. **助记符法**: 创建首字母缩写或韵律助记

要求:
1. 技巧要简单易用
2. 技巧要科学有效
3. 技巧要生动有趣
4. 提供预计掌握时间

输出格式: 严格按照JSON格式返回,不要包含其他内容。`;
  }

  /**
   * 获取释义系统提示词
   */
  private getExplanationSystemPrompt(): string {
    return `你是一个专业的英语词典编纂专家,擅长编写不同难度的词汇释义。

你的任务是根据学习者的词汇量水平,生成适合的释义内容。

难度级别:
1. **beginner**: 使用简单中文释义,避免复杂术语
2. **intermediate**: 简单英语+中文辅助
3. **advanced**: 纯英语释义,包含同义词反义词

要求:
1. 释义准确清晰
2. 同义词要地道常用
3. 搭配要实用高频
4. 难度要符合目标水平

输出格式: 严格按照JSON格式返回,不要包含其他内容。`;
  }

  /**
   * 解析例句响应
   */
  private parseExample(content: string, style: 'visual' | 'linguistic' | 'contextual'): GeneratedExample {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sentence: parsed.sentence || '',
          translation: parsed.translation || '',
          scenario: parsed.scenario || '',
          difficulty: parsed.difficulty || 'intermediate',
          style: style
        };
      }
    } catch (error) {
      console.error('解析例句失败:', error);
    }

    // 返回默认值
    return {
      sentence: `This is an example sentence with ${content}.`,
      translation: '这是一个例句。',
      scenario: '通用场景',
      difficulty: 'intermediate',
      style
    };
  }

  /**
   * 解析记忆技巧响应
   */
  private parseMemoryTip(content: string): GeneratedMemoryTip {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          technique: parsed.technique || 'association',
          title: parsed.title || '记忆技巧',
          content: parsed.content || '',
          effectiveness: parsed.effectiveness || 0.7,
          estimatedTime: parsed.estimatedTime || 5
        };
      }
    } catch (error) {
      console.error('解析记忆技巧失败:', error);
    }

    // 返回默认值
    return {
      technique: 'association',
      title: '联想记忆法',
      content: '通过联想相关的图像或场景来记忆这个单词。',
      effectiveness: 0.6,
      estimatedTime: 5
    };
  }

  /**
   * 解析释义响应
   */
  private parseExplanation(content: string): GeneratedExplanation {
    try {
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          definition: parsed.definition || '',
          difficulty: parsed.difficulty || 'intermediate',
          synonyms: parsed.synonyms || [],
          antonyms: parsed.antonyms || [],
          collocations: parsed.collocations || []
        };
      }
    } catch (error) {
      console.error('解析释义失败:', error);
    }

    // 返回默认值
    return {
      definition: 'Word definition',
      difficulty: 'intermediate',
      synonyms: [],
      antonyms: [],
      collocations: []
    };
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(contentType: string, wordId: string, word: string): string {
    return `${contentType}_${wordId}_${word}`;
  }

  /**
   * 更新状态
   */
  private updateState(generationTime: number): void {
    this.state.totalGenerated++;
    this.state.lastGeneratedAt = Date.now();

    // 更新平均生成时间
    const currentAvg = this.state.averageGenerationTime;
    this.state.averageGenerationTime = (currentAvg * (this.state.totalGenerated - 1) + generationTime) / this.state.totalGenerated;

    // 清理过期缓存
    if (this.config.cacheEnabled) {
      this.cleanupCache();
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    const ttl = this.config.cacheTTL * 1000;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitCount: number } {
    let hitCount = 0;
    for (const item of this.cache.values()) {
      hitCount += item.hitCount;
    }
    return {
      size: this.cache.size,
      hitCount
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取生成器状态
   */
  getState(): ContentGeneratorState {
    return { ...this.state };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ContentGeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): ContentGeneratorConfig {
    return { ...this.config };
  }
}

// 导出单例
export const personalizedContentGenerator = new PersonalizedContentGenerator();
