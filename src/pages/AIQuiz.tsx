import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Loader2,
  ArrowRight,
  RefreshCw,
  Home,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useAppStore } from '../store'
import { aiService } from '../services/ai'
import { AIQuiz, QuizQuestion } from '../services/ai/types'

type QuizState = 'setup' | 'loading' | 'playing' | 'result'

export default function AIQuizPage() {
  const { words, currentBook, todayStats, updateTodayStats } = useAppStore()
  const [quizState, setQuizState] = useState<QuizState>('setup')
  const [quiz, setQuiz] = useState<AIQuiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false) // AI判断翻译题时的加载状态

  // 智能答案判定函数
  const checkAnswer = async (userAnswer: string, correctAnswer: string, question: QuizQuestion): Promise<boolean> => {
    // 跳过的题目不算错
    if (userAnswer === '__skip__') return false

    // 选择题：严格匹配
    if (question.type === 'choice') {
      return userAnswer === correctAnswer
    }

    // 标准化函数：去除空格、标点，转小写
    const normalize = (str: string) => {
      return str
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:'"()，。！？；：""（）]/g, '')
        .replace(/\s+/g, ' ')
    }

    const normalizedUser = normalize(userAnswer)
    const normalizedCorrect = normalize(correctAnswer)

    // 拼写题：严格但忽略大小写
    if (question.type === 'spelling') {
      return normalizedUser === normalizedCorrect
    }

    // 填空题：标准化后比较
    if (question.type === 'fill') {
      return normalizedUser === normalizedCorrect
    }

    // 翻译题：使用AI判断
    if (question.type === 'translation') {
      // 先做简单匹配
      if (normalizedUser === normalizedCorrect) {
        return true
      }

      // 如果AI服务已配置，使用AI判断
      if (aiService.isConfigured()) {
        try {
          setIsCheckingAnswer(true)
          const result = await aiService.checkTranslationAnswer(
            question.question,
            userAnswer,
            correctAnswer
          )
          setIsCheckingAnswer(false)
          return result.isCorrect
        } catch (error) {
          console.error('AI判断翻译失败，使用基础匹配:', error)
          setIsCheckingAnswer(false)
          // 降级：检查关键词是否包含
          const userWords = normalizedUser.split(' ')
          const correctWords = normalizedCorrect.split(' ')
          const matchedWords = userWords.filter(w => correctWords.includes(w))
          return matchedWords.length / correctWords.length >= 0.5
        }
      } else {
        // AI未配置，使用关键词匹配
        const userWords = normalizedUser.split(' ')
        const correctWords = normalizedCorrect.split(' ')
        const matchedWords = userWords.filter(w => correctWords.includes(w))
        return matchedWords.length / correctWords.length >= 0.5
      }
    }

    return false
  }

  const [score, setScore] = useState(0)
  const [isConfigured, setIsConfigured] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [answerResults, setAnswerResults] = useState<Record<string, boolean>>({}) // 缓存答案判定结果

  // 配置选项
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedTypes, setSelectedTypes] = useState<QuizQuestion['type'][]>(['choice', 'fill'])

  useEffect(() => {
    setIsConfigured(aiService.isConfigured())
  }, [])

  // 计时器
  useEffect(() => {
    if (quizState !== 'playing' || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState, timeLeft])

  const handleStartQuiz = async () => {
    if (!isConfigured || words.length === 0) return

    setQuizState('loading')
    
    try {
      // 随机选择单词（仅使用当前词库的单词）
      const bookWords = currentBook ? words.filter(w => currentBook.wordIds.includes(w.id)) : words
      const wordList = bookWords
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(questionCount * 2, bookWords.length))
        .map(w => w.word)

      const generatedQuiz = await aiService.generateQuiz(wordList, questionCount, selectedTypes)
      
      if (generatedQuiz.questions.length === 0) {
        throw new Error('生成题目失败')
      }

      setQuiz(generatedQuiz)
      setTimeLeft(generatedQuiz.timeLimit)
      setCurrentIndex(0)
      setAnswers({})
      setScore(0)
      setShowAnswer(false)
      setSessionStartTime(Date.now())
      setQuizState('playing')
    } catch (error) {
      console.error('生成测验失败:', error)
      alert('生成测验失败，请稍后重试')
      setQuizState('setup')
    }
  }

  const handleAnswer = async (answer: string) => {
    if (!quiz || showAnswer) return

    const question = quiz.questions[currentIndex]
    setAnswers(prev => ({ ...prev, [question.id]: answer }))

    // 使用智能判定检查答案
    const isCorrect = await checkAnswer(answer, question.correctAnswer, question)

    // 缓存判定结果
    setAnswerResults(prev => ({ ...prev, [question.id]: isCorrect }))

    setShowAnswer(true)

    // 计算得分（如果不是跳过）
    if (answer !== '__skip__' && isCorrect) {
      setScore(prev => prev + Math.floor(quiz.totalScore / quiz.questions.length))
    }
  }

  const handleNext = () => {
    if (!quiz) return
    
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = () => {
    // 计算学习时长（分钟）
    const duration = Math.round((Date.now() - sessionStartTime) / 60000)
    updateTodayStats({
      studyTime: todayStats.studyTime + duration,
    })
    setQuizState('result')
  }

  const handleRestart = () => {
    setQuizState('setup')
    setQuiz(null)
    setAnswers({})
    setAnswerResults({})
    setScore(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleType = (type: QuizQuestion['type']) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev // 至少保留一种
        return prev.filter(t => t !== type)
      }
      return [...prev, type]
    })
  }

  // 未配置 AI
  if (!isConfigured) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI 智能测验</h2>
          <p className="text-gray-600 mb-6">
            需要配置 AI 服务后才能使用智能测验功能。<br />
            AI 将根据你的词库自动生成个性化测验题目。
          </p>
          <a 
            href="#/settings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            前往设置
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  // 设置页面
  if (quizState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI 智能测验</h1>
          <p className="text-gray-500">
            AI 将根据你的词库 "{currentBook?.name || '未选择'}" 生成测验题目
          </p>
        </div>

        {words.length === 0 ? (
          <div className="bg-yellow-50 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-yellow-800">当前词库没有单词，请先添加单词或选择其他词库</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* 题目数量 */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">题目数量</label>
              <div className="flex gap-3">
                {[5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      questionCount === num
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {num} 题
                  </button>
                ))}
              </div>
            </div>

            {/* 题目类型 */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">题目类型</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: 'choice' as const, label: '选择题', desc: '选择正确答案' },
                  { type: 'fill' as const, label: '填空题', desc: '填写正确单词' },
                  { type: 'translation' as const, label: '翻译题', desc: '翻译句子' },
                  { type: 'spelling' as const, label: '拼写题', desc: '拼写单词' },
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedTypes.includes(type)
                        ? 'bg-purple-50 border-2 border-purple-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className={`font-medium ${selectedTypes.includes(type) ? 'text-purple-700' : 'text-gray-700'}`}>
                      {label}
                    </div>
                    <div className={`text-sm ${selectedTypes.includes(type) ? 'text-purple-500' : 'text-gray-500'}`}>
                      {desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 开始按钮 */}
            <button
              onClick={handleStartQuiz}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              开始测验
            </button>

            <p className="text-center text-gray-400 text-sm">
              共 {currentBook ? words.filter(w => currentBook.wordIds.includes(w.id)).length : words.length} 个单词可用于出题
            </p>
          </div>
        )}
      </div>
    )
  }

  // 加载中
  if (quizState === 'loading') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">AI 正在生成题目...</h2>
          <p className="text-gray-500">根据你的词库智能出题，请稍候</p>
        </div>
      </div>
    )
  }

  // 答题中
  if (quizState === 'playing' && quiz) {
    const question = quiz.questions[currentIndex]
    const userAnswer = answers[question.id]
    const isCorrect = answerResults[question.id] ?? (userAnswer === question.correctAnswer)

    return (
      <div className="max-w-2xl mx-auto">
        {/* 顶部状态栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <span className="text-gray-500 text-sm">进度</span>
              <span className="ml-2 font-bold text-gray-800">
                {currentIndex + 1} / {quiz.questions.length}
              </span>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <span className="text-gray-500 text-sm">得分</span>
              <span className="ml-2 font-bold text-purple-600">{score}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm ${
            timeLeft < 60 ? 'text-red-500' : 'text-gray-700'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* 题目卡片 */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* 题目类型标签 */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 flex items-center justify-between">
            <span className="text-white text-sm font-medium">
              {question.type === 'choice' && '选择题'}
              {question.type === 'fill' && '填空题'}
              {question.type === 'translation' && '翻译题'}
              {question.type === 'spelling' && '拼写题'}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              question.difficulty === 'easy' ? 'bg-green-400 text-green-900' :
              question.difficulty === 'medium' ? 'bg-yellow-400 text-yellow-900' :
              'bg-red-400 text-red-900'
            }`}>
              {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
            </span>
          </div>

          {/* 题目内容 */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-6">{question.question}</h3>

            {/* 选项/输入 */}
            {question.type === 'choice' && question.options && (
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index)
                  const isSelected = userAnswer === option
                  const isCorrectOption = option === question.correctAnswer
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={showAnswer}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                        showAnswer
                          ? isCorrectOption
                            ? 'bg-green-50 border-2 border-green-500'
                            : isSelected
                              ? 'bg-red-50 border-2 border-red-500'
                              : 'bg-gray-50 border-2 border-transparent'
                          : isSelected
                            ? 'bg-purple-50 border-2 border-purple-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                        showAnswer
                          ? isCorrectOption
                            ? 'bg-green-500 text-white'
                            : isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          : isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {letter}
                      </span>
                      <span className={showAnswer && isCorrectOption ? 'text-green-700 font-medium' : 'text-gray-700'}>
                        {option}
                      </span>
                      {showAnswer && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showAnswer && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* AI正在判断提示 - 显示在题目下方 */}
            {isCheckingAnswer && showAnswer && question.type === 'translation' && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-blue-700 text-sm font-medium">AI 正在分析您的翻译...</span>
              </div>
            )}

            {question.type === 'choice' && !showAnswer && (
              <button
                onClick={() => {
                  handleAnswer('__skip__')
                }}
                className="mt-4 w-full py-2 text-gray-600 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                不会，查看答案
              </button>
            )}

            {(question.type === 'fill' || question.type === 'spelling' || question.type === 'translation') && (
              <div>
                {/* 提示信息区域 - 拼写题不显示提示 */}
                {question.type !== 'spelling' && (
                  <div className="mb-4 space-y-3">
                    {/* 中文释义提示 - 默认显示（拼写题除外） */}
                    {question.hints?.translation && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          📖 中文释义：{question.hints.translation}
                        </p>
                      </div>
                    )}

                    {/* 字母提示 - 根据难度显示（拼写题除外） */}
                    {question.difficulty === 'easy' && question.hints?.prefix && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          💡 提示：单词开头是 <span className="font-bold text-green-900">{question.hints.prefix}</span>...
                        </p>
                      </div>
                    )}

                    {question.difficulty === 'medium' && question.hints?.firstLetter && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          💡 提示：首字母是 <span className="font-bold text-yellow-900">{question.hints.firstLetter}</span>
                        </p>
                      </div>
                    )}

                    {/* 难题提示 */}
                    {question.difficulty === 'hard' && question.type === 'fill' && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">
                          ⚠️ 这是一道难题，注意句子中的上下文和空缺部分
                        </p>
                      </div>
                    )}

                    {/* 通用提示 */}
                    {!question.hints?.translation && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">
                          {question.type === 'fill' && '💡 提示：根据句子中的上下文，填写正确的英文单词'}
                          {question.type === 'translation' && '💡 提示：将下面的句子翻译成英文'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 拼写题的特殊说明 */}
                {question.type === 'spelling' && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      ✏️ 拼写题：根据题目给出的中文释义，凭记忆拼写正确的英文单词
                    </p>
                  </div>
                )}

                {/* 难题自动转为选择题 */}
                {question.difficulty === 'hard' && question.type === 'fill' && question.options ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-2">这道题比较难，请从下面的选项中选择：</p>
                    {question.options.map((option, index) => {
                      const letter = String.fromCharCode(65 + index)
                      const isSelected = userAnswer === option
                      const isCorrectOption = option === question.correctAnswer

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswer(option)}
                          disabled={showAnswer}
                          className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                            showAnswer
                              ? isCorrectOption
                                ? 'bg-green-50 border-2 border-green-500'
                                : isSelected
                                  ? 'bg-red-50 border-2 border-red-500'
                                  : 'bg-gray-50 border-2 border-transparent'
                              : isSelected
                                ? 'bg-purple-50 border-2 border-purple-500'
                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                            showAnswer
                              ? isCorrectOption
                                ? 'bg-green-500 text-white'
                                : isSelected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              : isSelected
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {letter}
                          </span>
                          <span className={showAnswer && isCorrectOption ? 'text-green-700 font-medium' : 'text-gray-700'}>
                            {option}
                          </span>
                          {showAnswer && isCorrectOption && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                          {showAnswer && isSelected && !isCorrectOption && (
                            <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  /* 普通输入模式 */
                  <>
                    <input
                      type="text"
                      placeholder="请输入答案..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      disabled={showAnswer}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !showAnswer) {
                          handleAnswer((e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                    {!showAnswer && (
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                          handleAnswer(input?.value || '')
                        }}
                        className="mt-3 px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600"
                      >
                        确认
                      </button>
                    )}
                    {!showAnswer && (
                      <button
                        onClick={() => {
                          handleAnswer('__skip__')
                        }}
                        className="mt-3 ml-3 px-6 py-2 text-gray-600 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                      >
                        不会，查看答案
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 答案解析 */}
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl ${
                  userAnswer === '__skip__' ? 'bg-gray-50' :
                  isCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className={`flex items-center gap-2 font-medium mb-2 ${
                  userAnswer === '__skip__' ? 'text-gray-700' :
                  isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {userAnswer === '__skip__' ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      已跳过
                    </>
                  ) : isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      回答正确！
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      回答错误
                    </>
                  )}
                </div>
                <p className={`text-sm ${
                  userAnswer === '__skip__' ? 'text-gray-600' :
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  正确答案：{question.correctAnswer}
                </p>
                <p className="text-gray-600 text-sm mt-2">{question.explanation}</p>
              </motion.div>
            )}
          </div>

          {/* 下一题按钮 */}
          {showAnswer && (
            <div className="px-6 pb-6">
              <button
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                {currentIndex < quiz.questions.length - 1 ? (
                  <>
                    下一题
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    查看结果
                    <Trophy className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // 结果页面
  if (quizState === 'result' && quiz) {
    const totalQuestions = quiz.questions.length
    const correctCount = quiz.questions.filter(q => answerResults[q.id] === true).length
    const accuracy = (correctCount / totalQuestions) * 100

    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-8 text-center text-white">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">测验完成！</h2>
            <p className="text-white/80">
              {accuracy >= 80 ? '太棒了！继续保持！' :
               accuracy >= 60 ? '不错！还可以更好！' :
               '继续加油！多多练习！'}
            </p>
          </div>

          {/* 统计 */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{score}</div>
                <div className="text-sm text-gray-500">得分</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                <div className="text-sm text-gray-500">正确</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{accuracy.toFixed(0)}%</div>
                <div className="text-sm text-gray-500">正确率</div>
              </div>
            </div>

            {/* 题目回顾 */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">题目回顾</h3>
              <div className="space-y-2">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id]
                  const isCorrect = answerResults[question.id] ?? (userAnswer === question.correctAnswer)
                  return (
                    <div
                      key={question.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="flex-1 text-gray-700">{question.word}</span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                再测一次
              </button>
              <a
                href="#/"
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                返回首页
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
