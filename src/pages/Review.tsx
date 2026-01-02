import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, 
  RefreshCw, 
  Award,
  Clock
} from 'lucide-react'
import { useAppStore } from '../store'
import { Word } from '../types'
import ProgressBar from '../components/ProgressBar'
import { getQualityFromResponse } from '../utils/spaced-repetition'
import { useShortcuts, getShortcutDisplay } from '../hooks/useShortcuts'

export default function Review() {
  const { 
    getWordsToReview, 
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
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)

  const currentWord = words[currentIndex]

  useEffect(() => {
    loadWords()
  }, [])

  const loadWords = async () => {
    setIsLoading(true)
    const reviewWords = await getWordsToReview()
    // 限制每次复习数量
    const limitedWords = reviewWords.slice(0, 30)
    setWords(limitedWords)
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionComplete(false)
    setCorrectCount(0)
    setSessionStartTime(Date.now())
    if (limitedWords.length > 0) {
      startSession('review', 'all')
    }
    setIsLoading(false)
  }

  const playAudio = useCallback(() => {
    if (!currentWord) return
    // 取消当前正在播放的音频，防止重复播放
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = settings.pronunciation === 'us' ? 'en-US' : 'en-GB'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }, [currentWord, settings.pronunciation])

  useEffect(() => {
    if (currentWord && settings.autoPlay) {
      playAudio()
    }
    setStartTime(Date.now())
  }, [currentIndex, currentWord])

  const handleResponse = async (remembered: boolean, difficulty: 'easy' | 'good' | 'hard' | 'again') => {
    if (!currentWord) return
    
    const responseTime = Date.now() - startTime
    const qualityMap = { easy: 5, good: 4, hard: 3, again: 1 }
    const quality = remembered ? qualityMap[difficulty] : getQualityFromResponse(responseTime, false)
    
    // 更新学习记录
    await updateRecord(currentWord.id, remembered, quality)
    recordWordResult(currentWord.id, remembered)
    
    // 统计逻辑：只有第一次正确回答才增加正确数
    // 如果是 "again" 或 "hard"，该单词会再次出现
    if (remembered && difficulty !== 'hard') {
      setCorrectCount(c => c + 1)
    }
    
    // 优化复习逻辑：如果不记得或觉得困难，加入到本轮复习队列末尾
    if (difficulty === 'again' || difficulty === 'hard') {
      setWords(prev => [...prev, currentWord])
    }
    
    await updateTodayStats({
      reviewedWords: todayStats.reviewedWords + 1,
    })
    
    goToNext()
  }

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1)
      setShowAnswer(false)
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
    setShowAnswer(prev => !prev)
  }, [])
  
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
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">暂无待复习单词</h2>
          <p className="text-gray-500 mb-6">
            所有单词都在记忆巩固期，请稍后再来复习
          </p>
          <button
            onClick={loadWords}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>
    )
  }

  if (sessionComplete) {
    const accuracy = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0
    const duration = Math.round((Date.now() - sessionStartTime) / 60000)
    
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">复习完成！</h2>
          <p className="text-gray-500 mb-6">本轮复习了 {words.length} 个单词</p>
          
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{correctCount}</p>
                <p className="text-gray-500 text-sm">记住了</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{words.length - correctCount}</p>
                <p className="text-gray-500 text-sm">忘记了</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{duration}</p>
                <p className="text-gray-500 text-sm">分钟</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-600">正确率: <span className="font-bold text-green-500">{accuracy}%</span></p>
            </div>
          </div>

          <button
            onClick={loadWords}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            继续复习
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 进度条 */}
      <div className="mb-6">
        <ProgressBar current={currentIndex + 1} total={words.length} color="green" />
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="p-6">
            {showAnswer ? (
              <div className="space-y-3">
                <p className="text-center text-gray-500 text-sm mb-4">你记住这个单词了吗？</p>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleResponse(true, 'easy')}
                    className="py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-medium transition-colors text-sm flex flex-col items-center"
                  >
                    <span>太简单</span>
                    <span className="text-xs opacity-60 mt-1">{getShortcutDisplay(settings.shortcuts?.rateEasy || 'Digit1')}</span>
                  </button>
                  <button
                    onClick={() => handleResponse(true, 'good')}
                    className="py-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl font-medium transition-colors text-sm flex flex-col items-center"
                  >
                    <span>记住了</span>
                    <span className="text-xs opacity-60 mt-1">{getShortcutDisplay(settings.shortcuts?.rateGood || 'Digit2')}</span>
                  </button>
                  <button
                    onClick={() => handleResponse(true, 'hard')}
                    className="py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl font-medium transition-colors text-sm flex flex-col items-center"
                  >
                    <span>有点难</span>
                    <span className="text-xs opacity-60 mt-1">{getShortcutDisplay(settings.shortcuts?.rateHard || 'Digit3')}</span>
                  </button>
                  <button
                    onClick={() => handleResponse(false, 'again')}
                    className="py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors text-sm flex flex-col items-center"
                  >
                    <span>忘记了</span>
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
      
      {/* 快捷键提示 */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400">
          快捷键: {getShortcutDisplay(settings.shortcuts?.playAudio || 'KeyR')} 播放发音
        </p>
      </div>
    </div>
  )
}
