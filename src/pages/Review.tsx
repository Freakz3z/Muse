import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  RefreshCw,
  Award,
  Clock,
  Zap,
  Brain
} from 'lucide-react'
import { useAppStore } from '../store'
import { Word } from '../types'
import ProgressBar from '../components/ProgressBar'
import { getQualityFromResponse } from '../utils/spaced-repetition'
import { useShortcuts, getShortcutDisplay } from '../hooks/useShortcuts'
import { voiceService } from '../services/voice'
import { getProfileManager } from '../services/ai-core'
import { personalizedContentLoader } from '../utils/personalized-content-helper'
import type { GeneratedMemoryTip } from '../types/personalized-content'
import { Sparkles, Lightbulb, Loader2 } from 'lucide-react'

type ReviewMode = 'smart' | 'quick'

// 获取当前时段
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

// 记录复习事件到AI画像系统
const recordReviewEvent = async (
  word: Word,
  result: 'correct' | 'incorrect',
  timeTaken: number,
  sessionLength: number
) => {
  try {
    const profileManager = getProfileManager()
    await profileManager.recordEvent({
      wordId: word.id,
      word: word.word,
      timestamp: Date.now(),
      action: 'review',
      result,
      confidence: result === 'correct' ? 0.8 : 0.3,
      timeTaken,
      context: {
        sessionLength,
        timeOfDay: getTimeOfDay(),
      },
    })
  } catch (error) {
    console.error('记录复习事件失败:', error)
    // 不阻塞用户学习，静默失败
  }
}

export default function Review() {
  const {
    getWordsToReview,
    getAllLearnedWords,
    updateRecord,
    updateTodayStats,
    todayStats,
    settings,
    startSession,
    endSession,
    recordWordResult,
    records
  } = useAppStore()

  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [answerStartTime, setAnswerStartTime] = useState<number>(0) // 记录显示答案的时间
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [reviewMode, setReviewMode] = useState<ReviewMode>('smart')
  const [isProcessing, setIsProcessing] = useState(false)
  // 使用 Map 追踪每个单词的最终状态：'remembered' | 'forgot'
  const [wordResults, setWordResults] = useState<Map<string, 'remembered' | 'forgot'>>(new Map())
  const [showRepeatHint, setShowRepeatHint] = useState(false) // 显示重考提示
  const isProcessingRef = useRef(false)

  // 个性化内容状态
  const [personalizedMemoryTip, setPersonalizedMemoryTip] = useState<GeneratedMemoryTip | null>(null)
  const [showPersonalizedContent, setShowPersonalizedContent] = useState(false)
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false)

  const currentWord = words[currentIndex]

  useEffect(() => {
    loadWords()
  }, [])

  const loadWords = async () => {
    setIsLoading(true)

    let reviewWords: Word[] = []

    if (reviewMode === 'smart') {
      // 智能复习模式：使用 SM-2 算法，只获取到期的单词
      reviewWords = await getWordsToReview()
    } else {
      // 快速复习模式：获取所有学过的单词
      const learnedWords = await getAllLearnedWords()
      // 按最近学习时间排序
      reviewWords = learnedWords.sort((a, b) => {
        const recordA = records.get(a.id)
        const recordB = records.get(b.id)
        return (recordB?.lastReviewAt || 0) - (recordA?.lastReviewAt || 0)
      })
    }

    // 限制每次复习数量
    const limit = reviewMode === 'quick' ? (settings.quickReviewLimit || 30) : 30
    const limitedWords = reviewWords.slice(0, limit)
    setWords(limitedWords)
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionComplete(false)
    setWordResults(new Map())
    setSessionStartTime(Date.now())
    if (limitedWords.length > 0) {
      startSession('review', 'all')
    }
    setIsLoading(false)
  }

  // 当切换复习模式时重新加载单词
  useEffect(() => {
    if (!isLoading) {
      loadWords()
    }
  }, [reviewMode])

  const playAudio = useCallback(async () => {
    if (!currentWord) return
    try {
      await voiceService.play(currentWord.word, settings.pronunciation)
    } catch (error) {
      console.error('Audio playback failed:', error)
    }
  }, [currentWord, settings.pronunciation])

  useEffect(() => {
    if (currentWord && settings.autoPlay) {
      playAudio()
    }
    setStartTime(Date.now())
  }, [currentIndex, currentWord])

  const handleResponse = async (remembered: boolean, difficulty: 'easy' | 'good' | 'hard' | 'again') => {
    if (!currentWord || isProcessingRef.current) return

    // 智能映射: 如果用户选择"记住了"(good),根据答题时间决定是easy还是good
    let actualDifficulty = difficulty
    if (difficulty === 'good') {
      const answerResponseTime = Date.now() - answerStartTime
      // 反应时间<2.5秒视为easy,否则为good
      actualDifficulty = answerResponseTime < 2500 ? 'easy' : 'good'
      console.log(`智能映射: 答题时间${answerResponseTime}ms -> ${actualDifficulty}`)
    }

    isProcessingRef.current = true
    setIsProcessing(true)

    try {
      const responseTime = Date.now() - startTime
      const qualityMap = { easy: 5, good: 4, hard: 3, again: 1 }
      const quality = remembered ? qualityMap[actualDifficulty] : getQualityFromResponse(responseTime, false)

      // 更新学习记录
      await updateRecord(currentWord.id, remembered, quality)
      recordWordResult(currentWord.id, remembered)

      // 记录复习事件到AI画像系统
      await recordReviewEvent(
        currentWord,
        remembered ? 'correct' : 'incorrect',
        responseTime,
        words.length
      )

      // 更新单词结果状态
      // easy/good: 记住了，不再出现
      // hard/again: 需要再复习，会重新加入队列
      const finalStatus: 'remembered' | 'forgot' =
        (actualDifficulty === 'easy' || actualDifficulty === 'good') ? 'remembered' : 'forgot'

      setWordResults(prev => {
        const newMap = new Map(prev)
        newMap.set(currentWord.id, finalStatus)
        return newMap
      })

      // 优化复习逻辑：如果不记得或觉得困难，加入到本轮复习队列末尾
      if (actualDifficulty === 'again' || actualDifficulty === 'hard') {
        setWords(prev => [...prev, currentWord])
        // 显示重考提示
        setShowRepeatHint(true)
        // 2秒后自动隐藏提示
        setTimeout(() => setShowRepeatHint(false), 2000)
      }

      await updateTodayStats({
        reviewedWords: todayStats.reviewedWords + 1,
      })

      goToNext()
    } finally {
      isProcessingRef.current = false
      setIsProcessing(false)
    }
  }

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1)
      setShowAnswer(false)
      // 重置个性化内容
      setPersonalizedMemoryTip(null)
      setShowPersonalizedContent(false)
      setIsLoadingPersonalized(false)
    } else {
      const duration = Math.round((Date.now() - sessionStartTime) / 60000)
      updateTodayStats({
        studyTime: todayStats.studyTime + duration,
      })
      setSessionComplete(true)
      endSession()
    }
  }
  
  // 切换显示答案
  const toggleAnswer = useCallback(() => {
    if (!showAnswer) {
      // 显示答案时记录时间
      setAnswerStartTime(Date.now())
    }
    setShowAnswer(prev => !prev)
  }, [showAnswer])

  // 加载个性化记忆技巧
  const loadPersonalizedMemoryTip = useCallback(async () => {
    if (!currentWord) return

    // 检查 AI 配置
    const aiConfig = JSON.parse(localStorage.getItem('ai_config') || '{}')
    if (!aiConfig.enabled) {
      return
    }

    setIsLoadingPersonalized(true)
    setShowPersonalizedContent(true)

    try {
      // 获取用户画像
      const profileManager = getProfileManager()
      const profile = await profileManager.getProfile()

      if (!profile) {
        console.warn('用户画像未创建,无法生成个性化内容')
        setIsLoadingPersonalized(false)
        return
      }

      // 只加载记忆技巧(复习场景最需要)
      const content = await personalizedContentLoader.loadContentForWord(
        currentWord,
        profile,
        {
          loadExamples: false,
          loadMemoryTip: true,
          loadExplanation: false,
        }
      )

      setPersonalizedMemoryTip(content.memoryTip)
    } catch (error) {
      console.error('加载个性化记忆技巧失败:', error)
    } finally {
      setIsLoadingPersonalized(false)
    }
  }, [currentWord])

  // 快捷键处理函数
  const handleShortcutEasy = useCallback(() => {
    if (showAnswer && currentWord) {
      handleResponse(true, 'easy')
    }
  }, [showAnswer, currentWord])
  
  const handleShortcutGood = useCallback(() => {
    if (showAnswer && currentWord) {
      handleResponse(true, 'good')
    }
  }, [showAnswer, currentWord])
  
  const handleShortcutHard = useCallback(() => {
    if (showAnswer && currentWord) {
      handleResponse(true, 'hard')
    }
  }, [showAnswer, currentWord])
  
  const handleShortcutAgain = useCallback(() => {
    if (showAnswer && currentWord) {
      handleResponse(false, 'again')
    }
  }, [showAnswer, currentWord])
  
  // 使用快捷键
  useShortcuts({
    showAnswer: toggleAnswer,
    playAudio,
    rateEasy: handleShortcutEasy,
    rateGood: handleShortcutGood,
    rateHard: handleShortcutHard,
    rateAgain: handleShortcutAgain,
  }, !isLoading && !sessionComplete && words.length > 0)

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载复习单词中...</p>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className={`w-20 h-20 ${reviewMode === 'smart' ? 'bg-green-100' : 'bg-violet-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Award className={`w-10 h-10 ${reviewMode === 'smart' ? 'text-green-500' : 'text-violet-500'}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {reviewMode === 'smart' ? '暂无待复习单词' : '还没有学过单词'}
          </h2>
          <p className="text-gray-500 mb-8">
            {reviewMode === 'smart'
              ? '所有单词都在记忆巩固期，请稍后再来复习'
              : '先去学习一些单词，再来复习吧！'}
          </p>

          {/* 操作按钮组 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReviewMode('quick')}
              className="px-6 py-3 bg-violet-500 text-white rounded-xl font-medium hover:bg-violet-600 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              快速复习
            </button>
            <button
              onClick={loadWords}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    // 从 wordResults Map 中计算统计数据
    const rememberedCount = Array.from(wordResults.values()).filter(s => s === 'remembered').length
    const forgotCount = Array.from(wordResults.values()).filter(s => s === 'forgot').length
    const totalUniqueWords = wordResults.size
    const accuracy = totalUniqueWords > 0 ? Math.round((rememberedCount / totalUniqueWords) * 100) : 0
    const duration = Math.round((Date.now() - sessionStartTime) / 60000)

    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">复习完成！</h2>
          <p className="text-gray-500 mb-8">本轮复习了 {totalUniqueWords} 个单词</p>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{rememberedCount}</p>
                <p className="text-gray-500 text-sm mt-1">记住了</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{forgotCount}</p>
                <p className="text-gray-500 text-sm mt-1">忘记了</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{duration}</p>
                <p className="text-gray-500 text-sm mt-1">分钟</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-600">正确率: <span className="font-bold text-green-500">{accuracy}%</span></p>
            </div>
          </div>

          <button
            onClick={loadWords}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            继续复习
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 复习模式切换 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">复习模式</h3>
            <span className="text-xs text-gray-500">
              {reviewMode === 'smart' ? '基于艾宾浩斯遗忘曲线' : '复习所有学过的单词'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReviewMode('smart')}
              className={`p-3 rounded-xl border-2 transition-all ${
                reviewMode === 'smart'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className={`w-5 h-5 ${reviewMode === 'smart' ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-semibold text-sm ${reviewMode === 'smart' ? 'text-blue-600' : 'text-gray-700'}`}>智能复习</div>
                  <div className={`text-xs ${reviewMode === 'smart' ? 'text-blue-500' : 'text-gray-500'}`}>
                    SM-2 算法
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setReviewMode('quick')}
              className={`p-3 rounded-xl border-2 transition-all ${
                reviewMode === 'quick'
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${reviewMode === 'quick' ? 'text-violet-500' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-semibold text-sm ${reviewMode === 'quick' ? 'text-violet-600' : 'text-gray-700'}`}>快速复习</div>
                  <div className={`text-xs ${reviewMode === 'quick' ? 'text-violet-500' : 'text-gray-500'}`}>
                    所有单词
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 进度条 */}
      <div className="mb-6">
        <ProgressBar current={currentIndex + 1} total={words.length} color={reviewMode === 'smart' ? 'green' : 'orange'} />
      </div>

      {/* 单词卡片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* 单词展示 */}
          <div className="p-8 text-center border-b">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">{currentWord.word}</h1>
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-500 text-lg">{currentWord.phonetic.us}</span>
              <button
                onClick={playAudio}
                className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 释义区域 */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {currentWord.meanings.map((meaning, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {meaning.partOfSpeech}
                      </span>
                      <div>
                        <p className="text-gray-600 text-sm">{meaning.definition}</p>
                        <p className="text-gray-800 font-medium">{meaning.translation}</p>
                      </div>
                    </div>
                  ))}

                  {currentWord.examples.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm mb-2">例句</p>
                      <p className="text-gray-700 italic">"{currentWord.examples[0]}"</p>
                    </div>
                  )}

                  {/* 难词重考提示 */}
                  <AnimatePresence>
                    {showRepeatHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-orange-700 text-sm">
                          <RefreshCw className="w-4 h-4" />
                          <span className="font-medium">这个词将在稍后再次出现</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 个性化记忆技巧区域 */}
                  {!showPersonalizedContent && !isLoadingPersonalized && (
                    <div className="mt-4">
                      <button
                        onClick={loadPersonalizedMemoryTip}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 text-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-green-200 hover:border-green-300"
                      >
                        <Lightbulb className="w-4 h-4" />
                        显示记忆技巧
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isLoadingPersonalized && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-teal-100">
                      <div className="flex items-center justify-center gap-2 text-teal-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">正在生成记忆技巧...</span>
                      </div>
                    </div>
                  )}

                  {personalizedMemoryTip && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-sm font-medium">个性化记忆技巧</span>
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          {personalizedMemoryTip.technique === 'association' && '联想记忆法'}
                          {personalizedMemoryTip.technique === 'wordRoot' && '词根词缀法'}
                          {personalizedMemoryTip.technique === 'scene' && '场景记忆法'}
                          {personalizedMemoryTip.technique === 'story' && '故事记忆法'}
                          {personalizedMemoryTip.technique === 'mnemonic' && '助记符法'}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 mb-2">{personalizedMemoryTip.title}</p>
                      <p className="text-gray-700 leading-relaxed text-sm mb-2">{personalizedMemoryTip.content}</p>
                      <div className="flex gap-3 text-xs">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          有效性: {(personalizedMemoryTip.effectiveness * 100).toFixed(0)}%
                        </span>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                          预计: {personalizedMemoryTip.estimatedTime}分钟
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="p-6">
            {showAnswer ? (
              <div className="space-y-3">
                <p className="text-center text-gray-500 text-sm mb-4">你记住这个单词了吗？</p>
                <div className="grid grid-cols-3 gap-3">
                  {/* 简化为3个按钮: 记住了, 有点难, 忘记了 */}
                  <button
                    onClick={() => handleResponse(true, 'good')}
                    disabled={isProcessing}
                    className="py-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-medium transition-colors flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-base">记住了</span>
                    <span className="text-xs opacity-60 mt-1">{getShortcutDisplay(settings.shortcuts?.rateGood || 'Digit2')}</span>
                  </button>
                  <button
                    onClick={() => handleResponse(true, 'hard')}
                    disabled={isProcessing}
                    className="py-4 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-medium transition-colors flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-base">有点难</span>
                    <span className="text-xs opacity-60 mt-1">{getShortcutDisplay(settings.shortcuts?.rateHard || 'Digit3')}</span>
                  </button>
                  <button
                    onClick={() => handleResponse(false, 'again')}
                    disabled={isProcessing}
                    className="py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-base">忘记了</span>
                    <span className="text-xs opacity-60 mt-1">{getShortcutDisplay(settings.shortcuts?.rateAgain || 'Digit4')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex flex-col items-center"
              >
                <span>显示答案</span>
                <span className="text-xs opacity-70 mt-1">{getShortcutDisplay(settings.shortcuts?.showAnswer || 'Space')}</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 底部信息 */}
      <div className="flex items-center justify-center mt-6 text-gray-400 text-sm">
        <Clock className="w-4 h-4 mr-2" />
        剩余 {words.length - currentIndex - 1} 个单词
      </div>
    </div>
  )
}
