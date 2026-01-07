/**
 * 卡牌游戏页面
 * 命运卡牌模式 - 随机题型+随机Buff
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Target,
  Clock,
  Flame,
  Star,
  Home,
  RotateCcw,
  BookOpen,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { CardGameEngine, createCardGameEngine } from '../services/card-game-engine'
import type {
  CardGameState,
  CardQuestion,
  CardGameResult,
} from '../types/card-game'
import CardHand from '../components/game/CardHand'
import ActiveBuffs from '../components/game/ActiveBuffs'
import GameGuide from '../components/game/GameGuide'
import BuffDetailModal from '../components/game/BuffDetailModal'
import { voiceService } from '../services/voice'
import type { Buff } from '../types/card-game'

// ==================== 游戏组件 ====================

interface GameHeaderProps {
  score: number
  combo: number
  maxCombo: number
  timeRemaining: number
  currentQuestion: number
  totalQuestions: number
}

function GameHeader({
  score,
  combo,
  maxCombo,
  timeRemaining,
  currentQuestion,
  totalQuestions,
}: GameHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="grid grid-cols-4 gap-4">
        {/* 分数 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-2xl font-bold">{score}</span>
          </div>
          <div className="text-xs text-gray-500">得分</div>
        </div>

        {/* 连击 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-2xl font-bold">{combo}</span>
          </div>
          <div className="text-xs text-gray-500">
            最高: {maxCombo}
          </div>
        </div>

        {/* 时间 */}
        <div className="text-center">
          <div
            className={`flex items-center justify-center gap-1 mb-1 ${
              timeRemaining < 30 ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-2xl font-bold">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="text-xs text-gray-500">时间</div>
        </div>

        {/* 进度 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-2xl font-bold">
              {currentQuestion}/{totalQuestions}
            </span>
          </div>
          <div className="text-xs text-gray-500">进度</div>
        </div>
      </div>
    </div>
  )
}

// ==================== 题型组件 ====================

interface QuestionAreaProps {
  question: CardQuestion
  onAnswer: (answer: string) => { isCorrect: boolean; points: number; message: string }
  isLoading: boolean
}

function QuestionArea({ question, onAnswer, isLoading }: QuestionAreaProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [spellingInput, setSpellingInput] = useState<string>('')
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isLoading) return
      setSelectedAnswer(answer)
      setShowFeedback(true)
      const result = onAnswer(answer)
      setIsCorrect(result.isCorrect)

      setTimeout(() => {
        setShowFeedback(false)
        setSelectedAnswer('')
        setSpellingInput('')
      }, 1500)
    },
    [isLoading, onAnswer]
  )

  const playAudio = async () => {
    if (question.word.audioUrl?.us) {
      try {
        await voiceService.play(question.word.word, 'us')
      } catch (error) {
        console.error('Audio playback failed:', error)
      }
    }
  }

  useEffect(() => {
    if (question.type === 'listening') {
      playAudio()
    }
  }, [question])

  const renderQuestion = () => {
    switch (question.type) {
      case 'choice':
        return (
          <div className="space-y-4">
            {/* 显示题目单词 */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {question.word.word}
              </div>
              <div className="text-gray-500">
                {question.word.phonetic.us}
              </div>
            </div>

            {/* 选项 */}
            <div className="space-y-3">
              {question.data.choices?.map((choice, index) => {
                const isSelected = selectedAnswer === choice
                const showCorrect = showFeedback && choice === question.data.correctAnswer

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: isLoading || showFeedback ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading || showFeedback ? 1 : 0.98 }}
                    onClick={() => !showFeedback && handleAnswer(choice)}
                    disabled={isLoading || showFeedback}
                    className={`
                      w-full p-4 rounded-xl text-left font-medium transition-all
                      ${isSelected && showFeedback
                        ? isCorrect
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-red-500 text-white shadow-lg'
                        : showCorrect
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-800 shadow-sm hover:shadow'
                      }
                      ${isLoading || showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-lg">{choice}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )

      case 'spelling':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">请拼写以下单词的中文释义</div>
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {question.word.word}
              </div>
              {question.showHint && question.data.hint && (
                <div className="text-sm text-gray-500">
                  提示: {question.data.hint}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && spellingInput.trim()) {
                    handleAnswer(spellingInput.trim())
                  }
                }}
                placeholder="输入中文释义..."
                disabled={isLoading || showFeedback}
                className={`
                  flex-1 px-4 py-3 rounded-xl border-2 font-medium
                  text-center text-lg
                  ${showFeedback
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 focus:border-blue-500 focus:outline-none'
                  }
                  ${isLoading || showFeedback ? 'cursor-not-allowed' : ''}
                `}
              />
              <button
                onClick={() => spellingInput.trim() && handleAnswer(spellingInput.trim())}
                disabled={isLoading || showFeedback || !spellingInput.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交
              </button>
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-white rounded-xl">
              <div className="text-xl leading-relaxed text-gray-800">
                {question.data.blankSentence}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {question.data.options?.map((option, index) => {
                const isSelected = selectedAnswer === option
                const showCorrect = showFeedback && option === question.data.correctAnswer

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: isLoading || showFeedback ? 1 : 1.05 }}
                    whileTap={{ scale: isLoading || showFeedback ? 1 : 0.95 }}
                    onClick={() => !showFeedback && handleAnswer(option)}
                    disabled={isLoading || showFeedback}
                    className={`
                      p-4 rounded-xl font-medium transition-all
                      ${isSelected && showFeedback
                        ? isCorrect
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-red-500 text-white shadow-lg'
                        : showCorrect
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-800 shadow-sm hover:shadow'
                      }
                      ${isLoading || showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {option}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500">
            未知题型: {question.type}
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* 题型标签 */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {question.type === 'choice' && '选择题'}
          {question.type === 'spelling' && '拼写题'}
          {question.type === 'fill_blank' && '填空题'}
          {question.type === 'listening' && '听力题'}
          {question.type === 'translation' && '翻译题'}
        </div>
        {question.difficulty >= 4 && (
          <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            困难
          </div>
        )}
      </div>

      {/* 题目内容 */}
      {renderQuestion()}

      {/* 反馈 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              mt-6 p-4 rounded-xl text-center font-medium
              ${isCorrect
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }
            `}
          >
            {isCorrect ? '✓ 正确！' : '✗ 错误！'}
            {isCorrect && question.points > 0 && (
              <span className="ml-2">+{question.points} 分</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== 游戏结果组件 ====================

interface GameResultProps {
  result: CardGameResult
  onRestart: () => void
  onHome: () => void
}

function GameResult({ result, onRestart, onHome }: GameResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">游戏结束！</h2>
          <p className="text-gray-500">命运卡牌挑战完成</p>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {result.score}
            </div>
            <div className="text-sm text-gray-600">总得分</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {result.maxCombo}
            </div>
            <div className="text-sm text-gray-600">最高连击</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {result.correctCount}
            </div>
            <div className="text-sm text-gray-600">正确</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {result.accuracy}%
            </div>
            <div className="text-sm text-gray-600">正确率</div>
          </div>
        </div>

        {/* 成就 */}
        {result.achievements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              解锁成就
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-medium"
                >
                  {achievement}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            再来一局
          </button>
          <button
            onClick={onHome}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
          >
            <Home className="w-5 h-5" />
            返回主页
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 主页面 ====================

export default function CardGamePage() {
  const navigate = useNavigate()
  const { words } = useAppStore()

  // 游戏状态
  const [gameEngine, setGameEngine] = useState<CardGameEngine | null>(null)
  const [gameState, setGameState] = useState<CardGameState | null>(null)
  const [gameResult, setGameResult] = useState<CardGameResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 模态框状态
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [selectedBuff, setSelectedBuff] = useState<Buff | null>(null)

  // 计时器
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化游戏
  const initGame = useCallback(() => {
    if (words.length === 0) {
      alert('请先添加单词到词库')
      navigate('/wordbook')
      return
    }

    const engine = createCardGameEngine(words, {
      maxQuestions: 10,
      handSize: 3,
      baseTime: 300,
      difficulty: 2,
      enableNegativeBuffs: true,
    })

    engine.onStateChanged((state) => {
      setGameState({ ...state })
    })

    setGameEngine(engine)
    setGameResult(null)

    // 生成第一题
    engine.generateNextQuestion()

    // 启动计时器
    startTimer(engine)
  }, [words, navigate])

  // 启动计时器
  const startTimer = (engine: CardGameEngine) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      engine.tick(1)

      if (engine.isGameOver()) {
        stopTimer()
        const result = engine.endGame()
        setGameResult(result)
      }
    }, 1000)
  }

  // 停止计时器
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [])

  // 初始化游戏
  useEffect(() => {
    initGame()
  }, [initGame])

  // 使用卡牌
  const handleCardUse = useCallback(
    (buffId: string) => {
      if (!gameEngine || !gameState?.currentQuestion) return

      gameEngine.useCard(buffId)
    },
    [gameEngine, gameState]
  )

  // 提交答案
  const handleAnswer = useCallback(
    (answer: string) => {
      if (!gameEngine) {
        return { isCorrect: false, points: 0, message: '游戏未初始化' }
      }

      setIsLoading(true)
      const result = gameEngine.submitAnswer(answer)
      setIsLoading(false)

      // 检查游戏是否结束
      if (gameEngine.isGameOver()) {
        stopTimer()
        const finalResult = gameEngine.endGame()
        setGameResult(finalResult)
      } else {
        // 生成下一题
        setTimeout(() => {
          gameEngine.generateNextQuestion()
        }, 1500)
      }

      return result
    },
    [gameEngine]
  )

  // 如果游戏未初始化或没有单词
  if (!gameState || !gameEngine) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载游戏...</p>
        </div>
      </div>
    )
  }

  // 显示游戏结果
  if (gameResult) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <GameResult
          result={gameResult}
          onRestart={initGame}
          onHome={() => navigate('/')}
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/games')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow transition-shadow text-gray-700"
            >
              <Home className="w-4 h-4" />
              返回
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGameGuide(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              游戏指南
            </button>
            <button
              onClick={() => initGame()}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow transition-shadow text-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>
          </div>
        </div>

        {/* 游戏头部 */}
        <GameHeader
          score={gameState.score}
          combo={gameState.combo}
          maxCombo={gameState.maxCombo}
          timeRemaining={gameState.timeRemaining}
          currentQuestion={gameState.currentQuestionIndex}
          totalQuestions={gameState.maxQuestions}
        />

        {/* 活跃Buff */}
        {gameState.activeBuffs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
              活跃效果
            </h3>
            <ActiveBuffs buffs={gameState.activeBuffs} />
          </div>
        )}

        {/* 题目区域 */}
        {gameState.currentQuestion && (
          <QuestionArea
            question={gameState.currentQuestion}
            onAnswer={handleAnswer}
            isLoading={isLoading}
          />
        )}

        {/* 手牌区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <CardHand
            cards={gameState.handCards}
            onCardUse={handleCardUse}
            onCardInfo={setSelectedBuff}
            disabled={!gameState.currentQuestion || isLoading}
          />
        </div>

        {/* 使用提示 */}
        <div className="text-center text-sm text-gray-500">
          💡 点击卡牌使用Buff，点击卡牌右上角图标查看详情！
        </div>

        {/* 模态框 */}
        <GameGuide isOpen={showGameGuide} onClose={() => setShowGameGuide(false)} />
        <BuffDetailModal
          buff={selectedBuff}
          isOpen={selectedBuff !== null}
          onClose={() => setSelectedBuff(null)}
        />
      </div>
    </div>
  )
}
