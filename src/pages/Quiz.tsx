import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  Trophy,
  RefreshCw,
  Keyboard,
  Sparkles,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { useAppStore } from '../store'
import { Word } from '../types'
import { defaultShortcuts } from '../types'
import ProgressBar from '../components/ProgressBar'
import { getProfileManager } from '../services/ai-core'
import { personalizedContentLoader } from '../utils/personalized-content-helper'
import type { GeneratedMemoryTip } from '../types/personalized-content'

type QuizMode = 'choice' | 'spelling'

// 获取当前时段
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'night'
}

// 记录测验事件到AI画像系统
const recordQuizEvent = async (
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
      action: 'quiz',
      result,
      confidence: result === 'correct' ? 0.9 : 0.2,
      timeTaken,
      context: {
        sessionLength,
        timeOfDay: getTimeOfDay(),
      },
    })
  } catch (error) {
    console.error('记录测验事件失败:', error)
    // 不阻塞用户学习，静默失败
  }
}

export default function Quiz() {
  const { words, records, settings, updateRecord } = useAppStore()

  const [mode, setMode] = useState<QuizMode | null>(null)
  const [quizWords, setQuizWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(0)

  // 个性化内容状态
  const [personalizedMemoryTip, setPersonalizedMemoryTip] = useState<GeneratedMemoryTip | null>(null)
  const [isLoadingPersonalized, setIsLoadingPersonalized] = useState(false)
  const [showMemoryTip, setShowMemoryTip] = useState(false)

  const currentWord = quizWords[currentIndex]

  const startQuiz = (selectedMode: QuizMode) => {
    setMode(selectedMode)

    // 从已学习的单词中选择测验词汇
    const learnedWordIds = new Set(records.keys())
    let availableWords = words.filter(w => learnedWordIds.has(w.id))

    // 如果学习的词不够，补充一些未学习的
    if (availableWords.length < 10) {
      const unlearned = words.filter(w => !learnedWordIds.has(w.id))
      availableWords = [...availableWords, ...unlearned.slice(0, 10 - availableWords.length)]
    }

    // 随机选择10个单词
    const shuffled = availableWords.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 10)

    setQuizWords(selected)
    setCurrentIndex(0)
    setScore(0)
    setQuizComplete(false)
    setStartTime(Date.now())
    setQuestionStartTime(Date.now()) // 初始化第一个问题开始时间

    if (selectedMode === 'choice' && selected.length > 0) {
      generateOptions(selected[0], selected)
    }
  }

  const generateOptions = (word: Word, allWords: Word[]) => {
    // 获取正确答案（中文释义）
    const correctAnswer = word.meanings[0]?.translation || ''
    
    // 从其他单词中随机选择3个干扰项
    const otherWords = allWords.filter(w => w.id !== word.id)
    const shuffled = otherWords.sort(() => Math.random() - 0.5)
    const distractors = shuffled.slice(0, 3).map(w => w.meanings[0]?.translation || '')
    
    // 混合选项
    const allOptions = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
  }

  const handleChoiceSelect = (answer: string) => {
    if (selectedAnswer) return

    const correct = answer === currentWord.meanings[0]?.translation
    const timeTaken = Date.now() - questionStartTime

    setSelectedAnswer(answer)
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    setShowResult(true)

    // 记录测验事件到AI画像系统
    recordQuizEvent(
      currentWord,
      correct ? 'correct' : 'incorrect',
      timeTaken,
      quizWords.length
    )

    // 如果答错,更新学习记录并加载个性化记忆技巧
    if (!correct) {
      // 答错时更新学习记录,标记为需复习(quality=1,表示"again")
      updateRecord(currentWord.id, false, 1).catch(err => {
        console.error('Failed to update record for quiz wrong answer:', err)
      })
      loadPersonalizedMemoryTip(currentWord)
    }

    setTimeout(() => {
      goToNext()
    }, correct ? 1500 : 3000) // 答错时延长显示时间,让用户看到记忆技巧
  }

  const handleSpellingSubmit = () => {
    const correct = inputValue.toLowerCase().trim() === currentWord.word.toLowerCase()
    const timeTaken = Date.now() - questionStartTime

    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    setShowResult(true)

    // 记录测验事件到AI画像系统
    recordQuizEvent(
      currentWord,
      correct ? 'correct' : 'incorrect',
      timeTaken,
      quizWords.length
    )

    // 如果答错,更新学习记录并加载个性化记忆技巧
    if (!correct) {
      // 答错时更新学习记录,标记为需复习(quality=1,表示"again")
      updateRecord(currentWord.id, false, 1).catch(err => {
        console.error('Failed to update record for quiz wrong answer:', err)
      })
      loadPersonalizedMemoryTip(currentWord)
    }

    setTimeout(() => {
      goToNext()
    }, correct ? 1500 : 3000) // 答错时延长显示时间,让用户看到记忆技巧
  }

  const goToNext = () => {
    if (currentIndex < quizWords.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowResult(false)
      setInputValue('')
      setQuestionStartTime(Date.now()) // 重置问题开始时间
      // 重置个性化内容
      setPersonalizedMemoryTip(null)
      setIsLoadingPersonalized(false)
      setShowMemoryTip(false)

      if (mode === 'choice') {
        generateOptions(quizWords[nextIndex], quizWords)
      }
    } else {
      setDuration(Math.round((Date.now() - startTime) / 1000))
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setMode(null)
    setQuizWords([])
    setCurrentIndex(0)
    setScore(0)
    setQuizComplete(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setInputValue('')
    // 重置个性化内容
    setPersonalizedMemoryTip(null)
    setIsLoadingPersonalized(false)
    setShowMemoryTip(false)
  }

  // 加载个性化记忆技巧
  const loadPersonalizedMemoryTip = async (word: Word) => {
    // 检查 AI 配置
    const aiConfig = JSON.parse(localStorage.getItem('ai_config') || '{}')
    if (!aiConfig.enabled) {
      return
    }

    setIsLoadingPersonalized(true)
    setShowMemoryTip(true)

    try {
      // 获取用户画像
      const profileManager = getProfileManager()
      const profile = await profileManager.getProfile()

      if (!profile) {
        console.warn('用户画像未创建,无法生成个性化内容')
        setIsLoadingPersonalized(false)
        return
      }

      // 只加载记忆技巧
      const content = await personalizedContentLoader.loadContentForWord(
        word,
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
  }

  // 模式选择界面
  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">单词测验</h1>
          <p className="text-gray-500">选择测验模式，检验你的学习成果</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startQuiz('choice')}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">选择题</h3>
            <p className="text-gray-500 text-sm">
              看单词选中文释义，四选一快速测验
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => startQuiz('spelling')}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Keyboard className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">拼写题</h3>
            <p className="text-gray-500 text-sm">
              看中文释义，拼写出对应的英文单词
            </p>
          </motion.button>
        </div>

        {words.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p>暂无可测验的单词，请先学习一些单词</p>
          </div>
        )}
      </div>
    )
  }

  // 测验完成界面
  if (quizComplete) {
    const accuracy = Math.round((score / quizWords.length) * 100)
    const grade = accuracy >= 90 ? 'A' : accuracy >= 80 ? 'B' : accuracy >= 70 ? 'C' : accuracy >= 60 ? 'D' : 'F'
    const gradeColors: Record<string, string> = {
      A: 'text-green-500',
      B: 'text-blue-500',
      C: 'text-yellow-500',
      D: 'text-orange-500',
      F: 'text-red-500',
    }

    return (
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">测验完成！</h2>
          <p className="text-gray-500 mb-6">你的成绩</p>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className={`text-6xl font-bold ${gradeColors[grade]} mb-4`}>
              {grade}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{score}/{quizWords.length}</p>
                <p className="text-gray-500 text-sm">正确数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{accuracy}%</p>
                <p className="text-gray-500 text-sm">正确率</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{duration}s</p>
                <p className="text-gray-500 text-sm">用时</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新测验
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // 测验进行中界面
  // 获取下一题的快捷键设置
  const nextQuestionShortcut = settings.shortcuts?.nextQuestion || defaultShortcuts.nextQuestion

  return (
    <div
      className="max-w-2xl mx-auto"
      onKeyDown={(e) => {
        if (e.code === nextQuestionShortcut && showResult) {
          e.preventDefault()
          goToNext()
        }
      }}
      tabIndex={0}
    >
      {/* 进度和分数 */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-gray-500 text-sm">
          第 {currentIndex + 1} / {quizWords.length} 题
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-500 font-medium">得分: {score}</span>
        </div>
      </div>
      
      <ProgressBar current={currentIndex + 1} total={quizWords.length} color="purple" showLabel={false} />

      {/* 测验卡片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="mt-6"
        >
          {mode === 'choice' ? (
            // 选择题模式
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8 text-center border-b bg-gradient-to-br from-purple-50 to-pink-50">
                <h2 className="text-4xl font-bold text-gray-800">{currentWord.word}</h2>
                <p className="text-gray-500 mt-2">{currentWord.phonetic.us}</p>
              </div>
              
              <div className="p-6 space-y-3">
                <p className="text-gray-500 text-sm text-center mb-4">请选择正确的中文释义</p>
                {options.map((option, index) => {
                  const isSelected = selectedAnswer === option
                  const isCorrectAnswer = option === currentWord.meanings[0]?.translation
                  
                  let buttonClass = 'w-full py-4 px-6 rounded-xl text-left transition-all border-2 '
                  
                  if (showResult) {
                    if (isCorrectAnswer) {
                      buttonClass += 'border-green-500 bg-green-50 text-green-700'
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonClass += 'border-red-500 bg-red-50 text-red-700'
                    } else {
                      buttonClass += 'border-gray-200 text-gray-400'
                    }
                  } else {
                    buttonClass += 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleChoiceSelect(option)}
                      disabled={!!selectedAnswer}
                      className={buttonClass}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}. </span>
                      {option}
                      {showResult && isCorrectAnswer && (
                        <Check className="inline-block w-5 h-5 ml-2 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <X className="inline-block w-5 h-5 ml-2 text-red-500" />
                      )}
                    </button>
                  )
                })}
                {/* 个性化记忆技巧 - 答错时显示 */}
                {showResult && !isCorrect && showMemoryTip && (
                  <div className="mt-4">
                    {isLoadingPersonalized ? (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-teal-100">
                        <div className="flex items-center justify-center gap-2 text-teal-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">正在生成记忆技巧...</span>
                        </div>
                      </div>
                    ) : personalizedMemoryTip ? (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
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
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 拼写题模式
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8 text-center border-b bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    拼写题
                  </span>
                </div>
                <p className="text-gray-500 mb-4">请根据下面的中文释义拼写正确的英文单词</p>
                <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentWord.meanings[0]?.translation}
                  </h2>
                  <p className="text-gray-400">
                    词性：{currentWord.meanings[0]?.partOfSpeech}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !showResult) {
                        handleSpellingSubmit()
                      }
                    }}
                    disabled={showResult}
                    placeholder="在此输入单词..."
                    className={`w-full py-4 px-6 text-2xl text-center border-2 rounded-xl outline-none transition-colors ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 focus:border-purple-400'
                    }`}
                  />

                  {showResult && !isCorrect && (
                    <p className="mt-3 text-center text-green-600 font-medium">
                      正确答案: {currentWord.word}
                    </p>
                  )}

                  {/* 个性化记忆技巧 - 答错时显示 */}
                  {showResult && !isCorrect && showMemoryTip && (
                    <div className="mt-4">
                      {isLoadingPersonalized ? (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-teal-100">
                          <div className="flex items-center justify-center gap-2 text-teal-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">正在生成记忆技巧...</span>
                          </div>
                        </div>
                      ) : personalizedMemoryTip ? (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
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
                      ) : null}
                    </div>
                  )}
                </div>

                {!showResult && (
                  <button
                    onClick={handleSpellingSubmit}
                    disabled={!inputValue.trim()}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认答案
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
