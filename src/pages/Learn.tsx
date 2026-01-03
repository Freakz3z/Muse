import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  Check,
  X,
  BookOpen,
  Lightbulb,
  Download,
  Sparkles,
  Brain,
  Copy,
  Loader2,
  Settings as SettingsIcon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  List
} from 'lucide-react'
import { useAppStore } from '../store'
import { Word } from '../types'
import ProgressBar from '../components/ProgressBar'
import { getQualityFromResponse } from '../utils/spaced-repetition'
import { presetWordLists } from '../data/words'
import { useShortcuts, getShortcutDisplay } from '../hooks/useShortcuts'
import { aiService } from '../services/ai'
import { dictionaryService } from '../services/dictionary'
import { GeneratedExample, WordMeaningExplanation, AIConfig, defaultAIConfig } from '../services/ai/types'
import { Link } from 'react-router-dom'

// 获取AI配置
const getAIConfig = (): AIConfig => {
  const savedConfig = localStorage.getItem('ai_config')
  return savedConfig ? JSON.parse(savedConfig) : defaultAIConfig
}

// 获取今天的日期字符串
const getTodayString = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// 今天学习记录的localStorage key
const getTodayLearnedKey = (): string => `learned_words_${getTodayString()}`

// 加载今天的学习记录
const loadTodayLearnedWords = (): Map<string, { known: boolean; index: number }> => {
  const key = getTodayLearnedKey()
  const saved = localStorage.getItem(key)
  if (!saved) return new Map()

  try {
    const data = JSON.parse(saved)
    return new Map(Object.entries(data))
  } catch {
    return new Map()
  }
}

// 保存今天的学习记录
const saveTodayLearnedWords = (learnedWords: Map<string, { known: boolean; index: number }>) => {
  const key = getTodayLearnedKey()
  const data = Object.fromEntries(learnedWords.entries())
  localStorage.setItem(key, JSON.stringify(data))
}

export default function Learn() {
  const {
    currentBook,
    getNewWords, 
    updateRecord, 
    updateTodayStats, 
    todayStats,
    settings,
    startSession,
    endSession,
    recordWordResult
  } = useAppStore()

  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const isProcessingRef = useRef(false)
  // 已学单词状态：Map<wordId, { known: boolean | null, index: number }>
  // known: true=认识, false=不认识, null=未学习
  const [learnedWords, setLearnedWords] = useState<Map<string, { known: boolean | null; index: number }>>(new Map())
  // 今天的所有学过的单词（包括之前的学习会话）
  const [todayLearnedWords, setTodayLearnedWords] = useState<Word[]>([])
  // 侧边栏展开状态
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // 查看历史单词的索引
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)

  // AI内容状态
  const [aiExamples, setAiExamples] = useState<GeneratedExample[]>([])
  const [aiExplanation, setAiExplanation] = useState<WordMeaningExplanation | null>(null)
  const [aiMemoryTip, setAiMemoryTip] = useState<string>('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)

  const currentWord = words[currentIndex]

  useEffect(() => {
    loadWords()
  }, [currentBook])

  const loadWords = async () => {
    setIsLoading(true)
    const newWords = await getNewWords(settings.dailyGoal - todayStats.newWords)
    setWords(newWords)
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionComplete(false)
    setCorrectCount(0)

    // 加载今天的学习记录（包括之前学习会话的记录）
    const todayLearned = loadTodayLearnedWords()

    // 初始化当前会话的单词为未学习状态
    const initialLearnedWords = new Map<string, { known: boolean | null; index: number }>()
    newWords.forEach((word, index) => {
      // 如果今天已经学过这个单词，使用之前的状态
      if (todayLearned.has(word.id)) {
        initialLearnedWords.set(word.id, todayLearned.get(word.id)!)
      } else {
        initialLearnedWords.set(word.id, { known: null, index })
      }
    })
    setLearnedWords(initialLearnedWords)

    // 加载今天所有学过的单词（用于侧边栏显示）
    await loadTodayWordsForSidebar()

    setViewingIndex(null)
    setSidebarOpen(false)
    setSessionStartTime(Date.now())
    if (newWords.length > 0 && currentBook) {
      startSession('learn', currentBook.id)
    }
    setIsLoading(false)
  }

  // 加载今天所有学过的单词用于侧边栏显示
  const loadTodayWordsForSidebar = async () => {
    const { words: allWords } = useAppStore.getState()
    const todayLearned = loadTodayLearnedWords()

    // 筛选出今天学过的单词
    const learnedWordIds = new Set(todayLearned.keys())
    const learnedWords = allWords.filter(w => learnedWordIds.has(w.id))

    setTodayLearnedWords(learnedWords)
  }

  // 判断当前是否在查看历史单词
  const isViewingHistory = viewingIndex !== null
  const displayWord = isViewingHistory ? words[viewingIndex] : currentWord
  const displayIndex = isViewingHistory ? viewingIndex : currentIndex

  // 当切换查看历史单词时，确保显示答案
  useEffect(() => {
    if (isViewingHistory && !showAnswer) {
      setShowAnswer(true)
    }
  }, [isViewingHistory])

  const playAudio = useCallback(() => {
    if (!displayWord) return
    // 取消当前正在播放的音频，防止重复播放
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(displayWord.word)
    utterance.lang = settings.pronunciation === 'us' ? 'en-US' : 'en-GB'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }, [displayWord, settings.pronunciation])

  useEffect(() => {
    // 只在当前学习单词变化时自动播放，查看历史时不播放
    if (currentWord && settings.autoPlay && !isViewingHistory) {
      playAudio()
    }
    setStartTime(Date.now())
    // 重置AI内容
    setAiExamples([])
    setAiExplanation(null)
    setAiMemoryTip('')
    setShowAIAnalysis(false)
  }, [currentIndex, currentWord, isViewingHistory])

  // 检查单词数据是否完整
  const isWordDataIncomplete = useCallback((word: Word): boolean => {
    const hasValidTranslation = word.meanings.some(m => 
      m.translation && 
      m.translation !== '待补充' && 
      m.translation !== '待翻译' &&
      /[\u4e00-\u9fa5]/.test(m.translation) // 包含中文字符
    )
    const hasValidPartOfSpeech = word.meanings.some(m => 
      m.partOfSpeech && 
      m.partOfSpeech !== 'unknown'
    )
    return !hasValidTranslation || !hasValidPartOfSpeech
  }, [])

  // 手动加载AI内容
  const loadAIContent = useCallback(async () => {
    if (!displayWord) return

    const aiConfig = getAIConfig()
    if (!aiConfig.enabled) {
      alert('请先在设置中配置 AI 服务')
      return
    }

    setIsLoadingAI(true)
    setShowAIAnalysis(true)
    try {
      // 如果单词数据不完整，先用AI补充
      if (isWordDataIncomplete(displayWord)) {
        const enrichedWord = await dictionaryService.enrichWord(displayWord)
        if (enrichedWord !== displayWord) {
          // 更新当前单词数据
          setWords(prevWords => prevWords.map((w, i) =>
            i === displayIndex ? enrichedWord : w
          ))
        }
      }

      // 并行加载AI内容（例句和词义解释）
      const [examples, explanation] = await Promise.all([
        aiService.generateExamplesWithTranslation(displayWord.word).catch(() => []),
        aiService.explainWordMeaning(displayWord.word).catch(() => null)
      ])

      setAiExamples(examples || [])
      setAiExplanation(explanation)

      // 使用AI生成记忆技巧（基于词义解释）
      if (explanation?.detailedExplanation) {
        const memoryTip = explanation.detailedExplanation
        setAiMemoryTip(memoryTip)
      }
    } catch (error) {
      console.error('Failed to load AI content:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }, [displayWord, displayIndex, isWordDataIncomplete])

  // 快捷键处理显示AI分析
  const handleShortcutAIAnalysis = useCallback(() => {
    if (showAnswer && !isLoadingAI && !showAIAnalysis) {
      loadAIContent()
    }
  }, [showAnswer, isLoadingAI, showAIAnalysis, loadAIContent])

  const handleKnow = async () => {
    if (!currentWord || isProcessingRef.current) return

    isProcessingRef.current = true
    setIsProcessing(true)

    try {
      const responseTime = Date.now() - startTime
      const quality = getQualityFromResponse(responseTime, true)

      await updateRecord(currentWord.id, true, quality)
      recordWordResult(currentWord.id, true)
      setCorrectCount(c => c + 1)

      // 记录为已学单词（认识）
      setLearnedWords(prev => {
        const newMap = new Map(prev)
        newMap.set(currentWord.id, { known: true, index: currentIndex })

        // 保存到今天的学习记录
        const todayLearned = loadTodayLearnedWords()
        todayLearned.set(currentWord.id, { known: true, index: currentIndex })
        saveTodayLearnedWords(todayLearned)

        return newMap
      })

      await updateTodayStats({
        newWords: todayStats.newWords + 1,
      })

      goToNext()
    } finally {
      isProcessingRef.current = false
      setIsProcessing(false)
    }
  }

  const handleDontKnow = async () => {
    if (!currentWord || isProcessingRef.current) return

    isProcessingRef.current = true
    setIsProcessing(true)

    try {
      const quality = getQualityFromResponse(0, false)
      await updateRecord(currentWord.id, false, quality)
      recordWordResult(currentWord.id, false)

      // 记录为已学单词（不认识）
      setLearnedWords(prev => {
        const newMap = new Map(prev)
        newMap.set(currentWord.id, { known: false, index: currentIndex })

        // 保存到今天的学习记录
        const todayLearned = loadTodayLearnedWords()
        todayLearned.set(currentWord.id, { known: false, index: currentIndex })
        saveTodayLearnedWords(todayLearned)

        return newMap
      })

      await updateTodayStats({
        newWords: todayStats.newWords + 1,
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
    } else {
      // 计算学习时长（分钟）
      const duration = Math.round((Date.now() - sessionStartTime) / 60000)
      updateTodayStats({
        studyTime: todayStats.studyTime + duration,
      })
      setSessionComplete(true)
      endSession()
    }
  }

  // 查看历史单词 - 支持查看任意已学单词
  const viewLearnedWord = useCallback((wordId: string) => {
    // 先检查是否在当前会话的单词列表中
    const indexInSession = words.findIndex(w => w.id === wordId)
    if (indexInSession !== -1) {
      // 在当前会话中,使用索引查看
      setViewingIndex(indexInSession)
    } else {
      // 不在当前会话中,需要临时添加到显示列表
      const word = todayLearnedWords.find(w => w.id === wordId)
      if (word) {
        // 将单词临时添加到当前words数组末尾用于显示
        setWords(prev => [...prev, word])
        // 设置查看索引为新增单词的索引
        setViewingIndex(words.length)
      }
    }
    setSidebarOpen(false)
  }, [words, todayLearnedWords])

  // 历史记录导航：上一个
  const goToPrevious = useCallback(() => {
    if (viewingIndex === null) return
    const newIndex = viewingIndex - 1
    if (newIndex >= 0) {
      setViewingIndex(newIndex)
    }
  }, [viewingIndex])

  // 历史记录导航：下一个
  const goToNextHistory = useCallback(() => {
    if (viewingIndex === null) return
    const newIndex = viewingIndex + 1
    // 如果下一个是未学习单词，返回当前学习
    if (newIndex >= words.length) {
      setViewingIndex(null)
      return
    }
    const nextWord = words[newIndex]
    const nextWordStatus = learnedWords.get(nextWord.id)
    if (nextWordStatus?.known === null) {
      // 未学习，返回当前学习
      setViewingIndex(null)
    } else {
      setViewingIndex(newIndex)
    }
  }, [viewingIndex, words.length, learnedWords])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // 切换显示答案 / 返回当前学习
  const toggleAnswerOrReturn = useCallback(() => {
    if (isViewingHistory) {
      setViewingIndex(null)
    } else {
      setShowAnswer(prev => !prev)
    }
  }, [isViewingHistory])

  // 快捷键处理函数 - 使用 useCallback 确保引用稳定
  // 查看历史时：markKnown=下一个, markUnknown=上一个
  // 正常学习时：markKnown=认识, markUnknown=不认识
  const handleShortcutKnow = useCallback(() => {
    if (isViewingHistory) {
      goToNextHistory()
    } else if (showAnswer && currentWord) {
      handleKnow()
    }
  }, [isViewingHistory, goToNextHistory, showAnswer, currentWord])

  const handleShortcutUnknown = useCallback(() => {
    if (isViewingHistory) {
      goToPrevious()
    } else if (showAnswer && currentWord) {
      handleDontKnow()
    }
  }, [isViewingHistory, goToPrevious, showAnswer, currentWord])

  // 使用快捷键
  useShortcuts({
    showAnswer: toggleAnswerOrReturn,
    markKnown: handleShortcutKnow,
    markUnknown: handleShortcutUnknown,
    playAudio,
    showAIAnalysis: handleShortcutAIAnalysis,
  }, !isLoading && !sessionComplete && words.length > 0)

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载单词中...</p>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    // 检查当前词库是否需要先下载
    const needsDownload = currentBook &&
      currentBook.wordIds.length === 0 &&
      currentBook.id.replace('book_', '') in presetWordLists

    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          {needsDownload ? (
            <>
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">词库需要下载</h2>
              <p className="text-gray-500 mb-6">
                当前词库「{currentBook.name}」尚未下载词汇数据。
                <br />
                请前往<span className="text-blue-500 font-medium">词库管理</span>页面下载。
              </p>
              <Link
                to="/wordbook"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
              >
                <BookOpen className="w-5 h-5" />
                前往词库管理
              </Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">今日学习已完成！</h2>
              <p className="text-gray-500 mb-6">
                {currentBook
                  ? `词库「${currentBook.name}」中暂无更多新词，或今日目标已达成`
                  : '请先选择一个词库开始学习'
                }
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wordbook"
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  词库
                </Link>
                <Link
                  to="/settings"
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  设置
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">学习完成！</h2>
          <p className="text-gray-500 mb-8">本轮学习了 {words.length} 个单词</p>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{correctCount}</p>
                <p className="text-gray-500 text-sm mt-1">掌握</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{words.length - correctCount}</p>
                <p className="text-gray-500 text-sm mt-1">需加强</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-gray-600">正确率: <span className="font-bold text-blue-500">{accuracy}%</span></p>
            </div>
          </div>

          <button
            onClick={loadWords}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            继续学习
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* 主内容区 */}
      <div className="flex-1 max-w-3xl mx-auto overflow-y-auto">
        {/* 顶部栏：进度条和侧边栏触发按钮 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <ProgressBar current={displayIndex + 1} total={words.length} color="blue" />
          </div>
          {/* 已学单词列表按钮 */}
          {(() => {
            const todayLearned = loadTodayLearnedWords()
            const todayCount = todayLearned.size
            return todayCount > 0 ? (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow transition-all text-sm"
                title="今日已学单词列表"
              >
                <List className="w-4 h-4" />
                <span className="font-medium">{todayCount}</span>
              </button>
            ) : null
          })()}
        </div>

        {/* 返回当前学习按钮 */}
        {isViewingHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <button
              onClick={() => setViewingIndex(null)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回当前学习</span>
              <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.showAnswer || 'Space')}</span>
            </button>
          </motion.div>
        )}

        {/* 单词卡片 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={displayIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* 单词展示 */}
            <div className="p-8 text-center border-b">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">{displayWord.word}</h1>
              <div className="flex items-center justify-center gap-4">
                <span className="text-gray-500 text-lg">{displayWord.phonetic.us}</span>
                <button
                  onClick={playAudio}
                  className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 释义区域 - 查看历史时始终显示 */}
            <AnimatePresence>
              {showAnswer || isViewingHistory ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    {/* 基础释义 */}
                    <div className="space-y-4">
                      {displayWord.meanings.map((meaning, index) => (
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
                    </div>

                  {/* AI词义解释 */}
                  {isLoadingAI && !aiExplanation && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">AI正在分析...</span>
                      </div>
                    </div>
                  )}

                  {showAIAnalysis && (
                    <>
                      {aiExplanation && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                          <div className="flex items-center gap-2 text-purple-600 mb-3">
                            <Brain className="w-4 h-4" />
                            <span className="text-sm font-medium">AI深度解释</span>
                            <Sparkles className="w-3 h-3" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-700 leading-relaxed font-medium">{aiExplanation.basicMeaning}</p>
                            {aiExplanation.detailedExplanation && (
                              <p className="text-gray-600 text-sm leading-relaxed">{aiExplanation.detailedExplanation}</p>
                            )}
                            {aiExplanation.usageNotes && (
                              <div className="mt-2 pt-2 border-t border-purple-100">
                                <p className="text-purple-600 text-xs font-medium mb-1">用法要点</p>
                                <p className="text-gray-600 text-sm">{aiExplanation.usageNotes}</p>
                              </div>
                            )}
                            {aiExplanation.commonMistakes && aiExplanation.commonMistakes.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-purple-100">
                                <p className="text-orange-600 text-xs font-medium mb-1">常见错误</p>
                                <div className="space-y-1">
                                  {aiExplanation.commonMistakes.map((mistake, idx) => (
                                    <p key={idx} className="text-gray-600 text-sm">• {mistake}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 例句区域（合并字典例句和AI例句） */}
                      {(currentWord.examples.length > 0 || aiExamples.length > 0) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Lightbulb className="w-4 h-4" />
                            <span>例句</span>
                          </div>

                          {/* 字典例句 */}
                          {currentWord.examples.slice(0, 2).map((example, index) => (
                            <div key={`dict-${index}`} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-700 italic mb-1">"{example}"</p>
                            </div>
                          ))}

                          {/* AI生成的例句 */}
                          {aiExamples.length > 0 && (
                            <>
                              {aiExamples.slice(0, 3).map((example, index) => (
                                <div key={`ai-${index}`} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 relative">
                                  <div className="flex items-center gap-1 mb-2">
                                    <Sparkles className="w-3 h-3 text-purple-500" />
                                    <span className="text-xs text-purple-600 font-medium">AI例句</span>
                                  </div>
                                  <p className="text-gray-700 italic mb-1">"{example.sentence}"</p>
                                  <p className="text-gray-600 text-sm">{example.translation}</p>
                                  <button
                                    onClick={() => copyToClipboard(example.sentence)}
                                    className="absolute top-2 right-2 p-1 hover:bg-white rounded transition-colors"
                                    title="复制例句"
                                  >
                                    <Copy className="w-3 h-3 text-purple-400" />
                                  </button>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}

                      {/* AI记忆技巧 */}
                      {aiMemoryTip && (
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-sm font-medium">深度理解</span>
                            <Sparkles className="w-3 h-3" />
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm">{aiMemoryTip}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="p-6 flex items-center justify-center gap-4">
            {isViewingHistory ? (
              // 查看历史模式：显示导航按钮
              <>
                <button
                  onClick={goToPrevious}
                  className="flex-1 max-w-40 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={viewingIndex === 0}
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    上一个
                  </span>
                  <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.markUnknown || 'KeyA')}</span>
                </button>
                {!showAIAnalysis && !isLoadingAI && (
                  <button
                    onClick={loadAIContent}
                    className="flex-1 max-w-40 py-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 border-2 border-dashed border-purple-200 hover:border-purple-300"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI分析
                    </span>
                    <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.showAIAnalysis || 'KeyW')}</span>
                  </button>
                )}
                {isLoadingAI && (
                  <div className="flex-1 max-w-40 py-4 bg-purple-50 rounded-xl font-medium flex flex-col items-center gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    <span className="text-sm text-purple-600">分析中...</span>
                  </div>
                )}
                <button
                  onClick={goToNextHistory}
                  className="flex-1 max-w-40 py-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-medium transition-colors flex flex-col items-center gap-1"
                >
                  <span className="flex items-center gap-2">
                    下一个
                    <ChevronRight className="w-5 h-5" />
                  </span>
                  <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.markKnown || 'KeyD')}</span>
                </button>
              </>
            ) : showAnswer ? (
              // 正常学习模式：显示答案已展开
              <>
                <button
                  onClick={handleDontKnow}
                  disabled={isProcessing}
                  className="flex-1 max-w-40 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <X className="w-5 h-5" />
                    不认识
                  </span>
                  <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.markUnknown || 'KeyA')}</span>
                </button>
                {!showAIAnalysis && !isLoadingAI && (
                  <button
                    onClick={loadAIContent}
                    className="flex-1 max-w-40 py-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 border-2 border-dashed border-purple-200 hover:border-purple-300"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI分析
                    </span>
                    <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.showAIAnalysis || 'KeyW')}</span>
                  </button>
                )}
                {isLoadingAI && (
                  <div className="flex-1 max-w-40 py-4 bg-purple-50 rounded-xl font-medium flex flex-col items-center gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                    <span className="text-sm text-purple-600">分析中...</span>
                  </div>
                )}
                <button
                  onClick={handleKnow}
                  disabled={isProcessing}
                  className="flex-1 max-w-40 py-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-medium transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    认识
                  </span>
                  <span className="text-xs opacity-60">{getShortcutDisplay(settings.shortcuts?.markKnown || 'KeyD')}</span>
                </button>
              </>
            ) : (
              // 正常学习模式：显示答案未展开
              <button
                onClick={() => setShowAnswer(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex flex-col items-center gap-1"
              >
                <span>显示答案</span>
                <span className="text-xs opacity-70">{getShortcutDisplay(settings.shortcuts?.showAnswer || 'Space')}</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      </div>

      {/* 侧边栏：已学单词列表 */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />
            {/* 侧边栏 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* 侧边栏头部 */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">已学单词</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 单词列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(() => {
                  // 合并今天所有学过的单词
                  const todayLearned = loadTodayLearnedWords()
                  const allLearnedEntries = Array.from(todayLearned.entries())

                  // 按学习顺序排序（index）
                  allLearnedEntries.sort((a, b) => a[1].index - b[1].index)

                  return allLearnedEntries.map(([wordId, { known }]) => {
                    // 先从当前words数组中查找
                    let word = words.find(w => w.id === wordId)
                    // 如果找不到，从todayLearnedWords中查找
                    if (!word) {
                      word = todayLearnedWords.find(w => w.id === wordId)
                    }
                    if (!word) return null

                    const meanings = word.meanings.map(m => m.translation).filter(Boolean).join('; ')
                    const partOfSpeech = word.meanings[0]?.partOfSpeech || ''

                    // 判断这个单词是否在当前学习列表中
                    const isInCurrentSession = words.some(w => w.id === wordId)

                    return (
                      <motion.button
                        key={wordId}
                        onClick={() => viewLearnedWord(wordId)}
                        className="w-full p-3 rounded-xl text-left transition-colors group bg-gray-50 hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-800 truncate">{word.word}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                known === true
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-orange-100 text-orange-600'
                              }`}>
                                {known === true ? '认识' : '不认识'}
                              </span>
                              {!isInCurrentSession && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">
                                  之前学习
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">{partOfSpeech}</div>
                            {meanings && (
                              <div className="text-sm text-gray-600 line-clamp-2">{meanings}</div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })
                })()}
              </div>

              {/* 侧边栏底部 */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  {(() => {
                    const todayLearned = loadTodayLearnedWords()
                    return `今日共学习 ${todayLearned.size} 个单词`
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
