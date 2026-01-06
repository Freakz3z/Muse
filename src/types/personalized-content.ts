/**
 * 个性化内容生成器类型定义
 *
 * 用于根据用户画像生成个性化的学习内容
 */

import type { AILearnerProfile } from './learner-profile';

/**
 * 内容生成请求
 */
export interface ContentGenerationRequest {
  wordId: string;
  word: string;
  definition: string;
  profile: AILearnerProfile;
  contentType: 'example' | 'memoryTip' | 'explanation';
}

/**
 * 例句生成结果
 */
export interface GeneratedExample {
  sentence: string;           // 例句
  translation: string;        // 中文翻译
  scenario: string;           // 使用场景
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  style: 'visual' | 'linguistic' | 'contextual';
}

/**
 * 记忆技巧生成结果
 */
export interface GeneratedMemoryTip {
  technique: 'association' | 'wordRoot' | 'scene' | 'story' | 'mnemonic';
  title: string;              // 技巧标题
  content: string;            // 技巧内容
  effectiveness: number;      // 有效性评分 0-1
  estimatedTime: number;      // 预计掌握时间(分钟)
}

/**
 * 释义生成结果
 */
export interface GeneratedExplanation {
  definition: string;         // 释义
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  synonyms: string[];         // 同义词
  antonyms: string[];         // 反义词
  collocations: string[];     // 搭配词
}

/**
 * 批量内容生成请求
 */
export interface BatchContentRequest {
  words: Array<{
    wordId: string;
    word: string;
    definition: string;
  }>;
  profile: AILearnerProfile;
  contentTypes: Array<'example' | 'memoryTip' | 'explanation'>;
}

/**
 * 内容生成配置
 */
export interface ContentGeneratorConfig {
  enableExamples: boolean;           // 启用例句生成
  enableMemoryTips: boolean;          // 启用记忆技巧生成
  enableAdaptiveDifficulty: boolean;  // 启用自适应难度
  maxExamples: number;               // 最大例句数量
  cacheEnabled: boolean;             // 启用缓存
  cacheTTL: number;                  // 缓存有效期(秒)
}

/**
 * 内容缓存项
 */
export interface ContentCacheItem {
  content: GeneratedExample | GeneratedMemoryTip | GeneratedExplanation;
  timestamp: number;
  hitCount: number;
}

/**
 * 内容生成器状态
 */
export interface ContentGeneratorState {
  totalGenerated: number;
  cacheHitRate: number;
  averageGenerationTime: number;
  lastGeneratedAt: number;
}
