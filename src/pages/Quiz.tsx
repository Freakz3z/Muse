import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  Timer,
  Trophy,
  RefreshCw,
  Keyboard
} from 'lucide-react'
import { useAppStore } from '../store'
import { Word, QuizType } from '../types'
import ProgressBar from '../components/ProgressBar'

type QuizMode = 'choice' | 'spelling'

export default function Quiz() {
  const { words, records, currentBook } = useAppStore()
  
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
    setSelectedAnswer(answer)
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    setShowResult(true)
    
    setTimeout(() => {
      goToNext()
    }, 1500)
  }

  const handleSpellingSubmit = () => {
    const correct = inputValue.toLowerCase().trim() === currentWord.word.toLowerCase()
    setIsCorrect(correct)
    if (correct) setScore(s => s + 1)
    setShowResult(true)
    
    setTimeout(() => {
      goToNext()
    }, 1500)
  }

  const goToNext = () => {
    if (currentIndex < quizWords.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowResult(false)
      setInputValue('')
      
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
  return (
    <div className="max-w-2xl mx-auto">
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
              </div>
            </div>
          ) : (
            // 拼写题模式
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8 text-center border-b bg-gradient-to-br from-purple-50 to-pink-50">
                <p className="text-gray-500 mb-2">请根据释义拼写单词</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentWord.meanings[0]?.translation}
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  ({currentWord.meanings[0]?.partOfSpeech})
                </p>
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
                    placeholder="输入单词..."
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
                </div>

                {!showResult && (
                  <button
                    onClick={handleSpellingSubmit}
                    disabled={!inputValue.trim()}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认
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
