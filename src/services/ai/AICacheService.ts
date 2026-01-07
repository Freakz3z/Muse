/**
 * AI分析结果缓存服务
 * 使用本地存储缓存AI分析结果,减少API调用
 */

import { aiService } from './index'
import {
  WordExplanation,
  GeneratedExample,
  WordMeaningExplanation,
  QuizQuestion
} from './types'

// 缓存键前缀
const CACHE_PREFIX = {
  WORD_EXPLANATION: 'ai:word:exp:',
  EXAMPLES: 'ai:examples:',
  MEANING: 'ai:meaning:',
  QUIZ: 'ai:quiz:',
  TRANSLATION: 'ai:trans:',
} as const

// 缓存时长(秒) - 使用localStorage作为缓存
const CACHE_TTL = {
  WORD_EXPLANATION: 30 * 24 * 3600,        // 30天
  EXAMPLES: 30 * 24 * 3600,               // 30天
  MEANING: 90 * 24 * 3600,                // 90天
  QUIZ: 7 * 24 * 3600,                    // 7天
  TRANSLATION: 7 * 24 * 3600,             // 7天
} as const

class AICacheService {
  private enabled: boolean = true
  private hitCount: number = 0
  private missCount: number = 0

  /**
   * 启用/禁用缓存
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total * 100).toFixed(1) : '0.0'
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
    }
  }

  /**
   * 重置统计
   */
  resetStats() {
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, params: string[]): string {
    return prefix + params.join(':')
  }

  /**
   * 从缓存获取数据
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null
    }

    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const data = JSON.parse(cached)
        // 检查是否过期
        if (data.expiry && data.expiry > Date.now()) {
          this.hitCount++
          return data.value as T
        } else {
          // 过期删除
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn(`缓存读取失败 [${key}]:`, error)
    }

    this.missCount++
    return null
  }

  /**
   * 保存数据到缓存
   */
  private async saveToCache(key: string, data: any, ttl: number): Promise<void> {
    if (!this.enabled) {
      return
    }

    try {
      const cacheData = {
        value: data,
        expiry: Date.now() + ttl * 1000
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn(`缓存保存失败 [${key}]:`, error)
    }
  }

  /**
   * 获取单词详细解释(带缓存)
   */
  async getWordExplanation(word: string, context?: string): Promise<WordExplanation> {
    const cacheKey = this.generateKey(CACHE_PREFIX.WORD_EXPLANATION, [word, context || ''])

    // 尝试从缓存获取
    const cached = await this.getFromCache<WordExplanation>(cacheKey)
    if (cached) {
      console.log(`✅ 缓存命中: 单词解释 [${word}]`)
      return cached
    }

    // 调用AI生成
    console.log(`⚡ AI生成: 单词解释 [${word}]`)
    const result = await aiService.generateWordExplanation(word, context)

    // 保存到缓存
    await this.saveToCache(cacheKey, result, CACHE_TTL.WORD_EXPLANATION)

    return result
  }

  /**
   * 获取例句(带缓存)
   */
  async getExamples(word: string, context?: string, count = 3): Promise<GeneratedExample[]> {
    const cacheKey = this.generateKey(CACHE_PREFIX.EXAMPLES, [word, context || '', String(count)])

    // 尝试从缓存获取
    const cached = await this.getFromCache<GeneratedExample[]>(cacheKey)
    if (cached) {
      console.log(`✅ 缓存命中: 例句 [${word}]`)
      return cached
    }

    // 调用AI生成
    console.log(`⚡ AI生成: 例句 [${word}]`)
    const result = await aiService.generateExamplesWithTranslation(word, context, count)

    // 保存到缓存
    await this.saveToCache(cacheKey, result, CACHE_TTL.EXAMPLES)

    return result
  }

  /**
   * 获取词义解释(带缓存)
   */
  async getWordMeaning(word: string, userLevel = 'intermediate'): Promise<WordMeaningExplanation> {
    const cacheKey = this.generateKey(CACHE_PREFIX.MEANING, [word, userLevel])

    // 尝试从缓存获取
    const cached = await this.getFromCache<WordMeaningExplanation>(cacheKey)
    if (cached) {
      console.log(`✅ 缓存命中: 词义解释 [${word}]`)
      return cached
    }

    // 调用AI生成
    console.log(`⚡ AI生成: 词义解释 [${word}]`)
    const result = await aiService.explainWordMeaning(word, userLevel)

    // 保存到缓存
    await this.saveToCache(cacheKey, result, CACHE_TTL.MEANING)

    return result
  }

  /**
   * 获取测验题目(带缓存)
   */
  async getQuiz(words: string[], questionCount = 10, types?: QuizQuestion['type'][]): Promise<{
    questions: QuizQuestion[]
    totalScore: number
    timeLimit: number
  }> {
    const cacheKey = this.generateKey(
      CACHE_PREFIX.QUIZ,
      [words.join(','), String(questionCount), types?.join(',') || '']
    )

    // 尝试从缓存获取
    const cached = await this.getFromCache<{
      questions: QuizQuestion[]
      totalScore: number
      timeLimit: number
    }>(cacheKey)
    if (cached) {
      console.log(`✅ 缓存命中: 测验题目`)
      return cached
    }

    // 调用AI生成
    console.log(`⚡ AI生成: 测验题目`)
    const result = await aiService.generateQuiz(words, questionCount, types)

    // 保存到缓存
    await this.saveToCache(cacheKey, result, CACHE_TTL.QUIZ)

    return result
  }

  /**
   * 翻译文本(带缓存)
   */
  async translate(text: string, to = 'zh'): Promise<string> {
    const cacheKey = this.generateKey(CACHE_PREFIX.TRANSLATION, [text, to])

    // 尝试从缓存获取
    const cached = await this.getFromCache<string>(cacheKey)
    if (cached) {
      console.log(`✅ 缓存命中: 翻译 [${text.slice(0, 20)}...]`)
      return cached
    }

    // 调用AI翻译
    console.log(`⚡ AI翻译: [${text.slice(0, 20)}...]`)
    const result = await aiService.translate(text, to)

    // 保存到缓存
    await this.saveToCache(cacheKey, result, CACHE_TTL.TRANSLATION)

    return result
  }

  /**
   * 清除指定单词的所有缓存
   */
  async clearWordCache(word: string): Promise<void> {
    if (!this.enabled) {
      return
    }

    try {
      localStorage.removeItem(CACHE_PREFIX.WORD_EXPLANATION + word)
      localStorage.removeItem(CACHE_PREFIX.EXAMPLES + word)
      localStorage.removeItem(CACHE_PREFIX.MEANING + word)
      console.log(`🗑️ 已清除单词缓存: ${word}`)
    } catch (error) {
      console.error('清除缓存失败:', error)
    }
  }

  /**
   * 清除所有AI缓存
   */
  async clearAllCache(): Promise<void> {
    console.warn('⚠️ 批量清除缓存功能需要实现ListKvs接口')
    // TODO: 实现ListKv后批量删除
    // 目前只能单个删除
  }

  /**
   * 预热缓存 - 为常用单词提前生成AI分析
   */
  async warmup(words: string[]): Promise<void> {
    console.log(`🔥 开始预热缓存，共 ${words.length} 个单词`)

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      try {
        // 检查是否已有缓存
        const cacheKey = this.generateKey(CACHE_PREFIX.WORD_EXPLANATION, [word, ''])
        const cached = await this.getFromCache(cacheKey)

        if (!cached) {
          // 没有缓存，生成并保存
          await this.getWordExplanation(word)
          console.log(`预热进度: ${i + 1}/${words.length} - ${word}`)
        }
      } catch (error) {
        console.error(`预热失败 [${word}]:`, error)
      }
    }

    console.log('✅ 缓存预热完成')
  }
}

// 导出单例
export const aiCacheService = new AICacheService()
