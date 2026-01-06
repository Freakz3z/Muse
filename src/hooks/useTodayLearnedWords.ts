/**
 * 管理今天学习单词的 Hook
 * 提供缓存机制，避免频繁访问 localStorage
 */

import { useState, useCallback, useRef } from 'react'

interface TodayLearnedWords {
  known: boolean
  index: number
}

const getTodayString = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const getTodayLearnedKey = (): string => `learned_words_${getTodayString()}`

// 全局缓存，避免跨组件重复读取
let globalCache: Map<string, TodayLearnedWords> | null = null
let cacheDate: string | null = null

export const loadTodayLearnedWords = (): Map<string, TodayLearnedWords> => {
  const today = getTodayString()

  // 如果缓存有效且日期匹配，直接返回缓存
  if (globalCache && cacheDate === today) {
    return globalCache
  }

  const key = getTodayLearnedKey()
  const saved = localStorage.getItem(key)
  if (!saved) {
    globalCache = new Map()
    cacheDate = today
    return globalCache
  }

  try {
    const data = JSON.parse(saved)
    globalCache = new Map(Object.entries(data))
    cacheDate = today
    return globalCache
  } catch {
    globalCache = new Map()
    cacheDate = today
    return globalCache
  }
}

export const saveTodayLearnedWords = (learnedWords: Map<string, TodayLearnedWords>) => {
  const key = getTodayLearnedKey()
  const data = Object.fromEntries(learnedWords.entries())
  localStorage.setItem(key, JSON.stringify(data))

  // 更新缓存
  globalCache = learnedWords
  cacheDate = getTodayString()
}

export const useTodayLearnedWords = () => {
  const [, forceUpdate] = useState({})
  const cacheRef = useRef<Map<string, TodayLearnedWords>>(loadTodayLearnedWords())

  // 获取当前学习记录
  const getTodayLearned = useCallback((): Map<string, TodayLearnedWords> => {
    return cacheRef.current
  }, [])

  // 更新学习记录
  const updateTodayLearned = useCallback((wordId: string, known: boolean, index: number) => {
    const updated = new Map(cacheRef.current)
    updated.set(wordId, { known, index })
    cacheRef.current = updated
    saveTodayLearnedWords(updated)
    forceUpdate({})
  }, [])

  // 获取今天学习的单词数量
  const getTodayCount = useCallback((): number => {
    return cacheRef.current.size
  }, [])

  // 获取今天掌握的单词数量
  const getTodayKnownCount = useCallback((): number => {
    return Array.from(cacheRef.current.values()).filter(w => w.known === true).length
  }, [])

  // 检查单词是否已学
  const isWordLearned = useCallback((wordId: string): boolean => {
    return cacheRef.current.has(wordId)
  }, [])

  // 获取单词的学习信息
  const getWordInfo = useCallback((wordId: string): TodayLearnedWords | undefined => {
    return cacheRef.current.get(wordId)
  }, [])

  return {
    getTodayLearned,
    updateTodayLearned,
    getTodayCount,
    getTodayKnownCount,
    isWordLearned,
    getWordInfo,
  }
}
