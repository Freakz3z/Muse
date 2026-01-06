/**
 * 个性化内容辅助工具
 *
 * 为Learn/Review/Quiz页面提供统一的个性化内容生成接口
 */

import { useState, useEffect } from 'react';
import { personalizedContentGenerator } from '../services/ai-core';
import type { AILearnerProfile } from '../types/learner-profile';
import type { Word } from '../types';
import type {
  GeneratedExample,
  GeneratedMemoryTip,
  GeneratedExplanation,
} from '../types/personalized-content';

/**
 * 个性化内容数据
 */
export interface PersonalizedContent {
  examples: GeneratedExample[];
  memoryTip: GeneratedMemoryTip | null;
  explanation: GeneratedExplanation | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * 个性化内容加载器
 */
export class PersonalizedContentLoader {
  private cache: Map<string, PersonalizedContent> = new Map();
  private loadingPromises: Map<string, Promise<PersonalizedContent>> = new Map();

  /**
   * 为单词加载个性化内容
   */
  async loadContentForWord(
    word: Word,
    profile: AILearnerProfile | null,
    options: {
      loadExamples?: boolean;
      loadMemoryTip?: boolean;
      loadExplanation?: boolean;
      forceRefresh?: boolean;
    } = {}
  ): Promise<PersonalizedContent> {
    const {
      loadExamples = true,
      loadMemoryTip = true,
      loadExplanation = true,
      forceRefresh = false,
    } = options;

    const cacheKey = `${word.id}_${word.word}`;

    // 检查缓存
    if (!forceRefresh && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // 如果没有profile,返回空内容
    if (!profile) {
      const emptyContent: PersonalizedContent = {
        examples: [],
        memoryTip: null,
        explanation: null,
        isLoading: false,
        error: '用户画像未创建',
      };
      this.cache.set(cacheKey, emptyContent);
      return emptyContent;
    }

    // 开始加载
    const loadingPromise = this.doLoadContent(
      word,
      profile,
      loadExamples,
      loadMemoryTip,
      loadExplanation
    );

    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * 实际加载内容的方法
   */
  private async doLoadContent(
    word: Word,
    profile: AILearnerProfile,
    loadExamples: boolean,
    loadMemoryTip: boolean,
    loadExplanation: boolean
  ): Promise<PersonalizedContent> {
    const result: PersonalizedContent = {
      examples: [],
      memoryTip: null,
      explanation: null,
      isLoading: true,
      error: null,
    };

    try {
      // 并行加载所有请求的内容
      const promises: Promise<void>[] = [];

      if (loadExamples) {
        promises.push(this.loadExamples(word, profile, result));
      }

      if (loadMemoryTip) {
        promises.push(this.loadMemoryTip(word, profile, result));
      }

      if (loadExplanation) {
        promises.push(this.loadExplanation(word, profile, result));
      }

      await Promise.all(promises);

      result.isLoading = false;
    } catch (error: any) {
      result.isLoading = false;
      result.error = error.message || '加载失败';
      console.error('加载个性化内容失败:', error);
    }

    return result;
  }

  /**
   * 加载例句
   */
  private async loadExamples(
    word: Word,
    profile: AILearnerProfile,
    result: PersonalizedContent
  ): Promise<void> {
    try {
      const example = await personalizedContentGenerator.generateExample({
        wordId: word.id,
        word: word.word,
        definition: word.meanings[0]?.translation || '未知',
        profile,
        contentType: 'example',
      });
      result.examples = [example];
    } catch (error) {
      console.error('加载例句失败:', error);
    }
  }

  /**
   * 加载记忆技巧
   */
  private async loadMemoryTip(
    word: Word,
    profile: AILearnerProfile,
    result: PersonalizedContent
  ): Promise<void> {
    try {
      const memoryTip = await personalizedContentGenerator.generateMemoryTip({
        wordId: word.id,
        word: word.word,
        definition: word.meanings[0]?.translation || '未知',
        profile,
        contentType: 'memoryTip',
      });
      result.memoryTip = memoryTip;
    } catch (error) {
      console.error('加载记忆技巧失败:', error);
    }
  }

  /**
   * 加载释义
   */
  private async loadExplanation(
    word: Word,
    profile: AILearnerProfile,
    result: PersonalizedContent
  ): Promise<void> {
    try {
      const explanation = await personalizedContentGenerator.generateExplanation({
        wordId: word.id,
        word: word.word,
        definition: word.meanings[0]?.translation || '未知',
        profile,
        contentType: 'explanation',
      });
      result.explanation = explanation;
    } catch (error) {
      console.error('加载释义失败:', error);
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除特定单词的缓存
   */
  clearWordCache(wordId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(wordId)) {
        this.cache.delete(key);
      }
    }
  }
}

// 导出单例
export const personalizedContentLoader = new PersonalizedContentLoader();

/**
 * React Hook: 使用个性化内容
 */
export const usePersonalizedContent = (
  word: Word | null,
  profile: AILearnerProfile | null,
  options: {
    loadExamples?: boolean;
    loadMemoryTip?: boolean;
    loadExplanation?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const [content, setContent] = useState<PersonalizedContent>({
    examples: [],
    memoryTip: null,
    explanation: null,
    isLoading: false,
    error: null,
  });

  const {
    loadExamples = true,
    loadMemoryTip = true,
    loadExplanation = true,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!word || !enabled) return;

    let cancelled = false;

    const loadContent = async () => {
      setContent(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await personalizedContentLoader.loadContentForWord(
        word,
        profile,
        { loadExamples, loadMemoryTip, loadExplanation }
      );

      if (!cancelled) {
        setContent(result);
      }
    };

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [word, profile, loadExamples, loadMemoryTip, loadExplanation, enabled]);

  return content;
};
