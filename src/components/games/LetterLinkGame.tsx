/**
 * 字母连线游戏组件
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Clock,
  RotateCcw,
  Sparkles,
  X,
  Check,
} from 'lucide-react'
import { LetterLinkGameEngine, GameState } from '../../services/games/LetterLinkGameEngine'
import { letterLinkAIService } from '../../services/ai/LetterLinkAIService'

interface LetterLinkGameProps {
  onGameEnd?: (result: {
    foundWords: string[]
    allWords: Array<{ word: string; hint?: string }>
    score: number
  }) => void
  gridSize?: number
  timeLimit?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

export default function LetterLinkGame({
  onGameEnd,
  gridSize = 5,
  timeLimit = 120,
  difficulty = 'medium',
}: LetterLinkGameProps) {
  const [engine] = useState(() => new LetterLinkGameEngine(gridSize, timeLimit))
  const [gameState, setGameState] = useState<GameState>(engine.getState())
  const [currentWord, setCurrentWord] = useState('')
  const [foundMessage, setFoundMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // 初始化游戏
  useEffect(() => {
    initializeGame()
  }, [])

  // 计时器
  useEffect(() => {
    if (gameState.isGameOver || isGenerating) return

    const timer = setInterval(() => {
      engine.updateTimer(1)
      setGameState(engine.getState())
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameOver, isGenerating, engine])

  // 游戏结束检测
  useEffect(() => {
    if (gameState.isGameOver && !isGenerating) {
      handleGameEnd()
    }
  }, [gameState.isGameOver, isGenerating])

  const initializeGame = async () => {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const result = await letterLinkAIService.generateGameGrid(
        gridSize,
        { min: 8, max: 12 },
        difficulty
      )

      engine.setGrid(result.letters, result.words)
      setGameState(engine.getState())
    } catch (error) {
      console.error('初始化游戏失败:', error)
      setGenerateError(error instanceof Error ? error.message : '生成游戏失败')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGameEnd = () => {
    const result = engine.getGameResult()
    onGameEnd?.(result)
  }

  const handleCellClick = (row: number, col: number) => {
    engine.handleCellClick(row, col)
    const newState = engine.getState()
    setGameState(newState)
    setCurrentWord(newState.currentPath.map(c => newState.grid[c.row][c.col].letter).join(''))
  }

  const handleSubmitWord = () => {
    const result = engine.submitWord()
    if (result.success) {
      if (result.isNew) {
        setFoundMessage(`✨ 找到新单词: ${result.word}`)
        setTimeout(() => setFoundMessage(null), 2000)
      } else {
        setFoundMessage(`✓ 已找到过: ${result.word}`)
        setTimeout(() => setFoundMessage(null), 1500)
      }
    } else if (result.word) {
      setFoundMessage(`✗ 无效单词: ${result.word}`)
      setTimeout(() => setFoundMessage(null), 1500)
    }
    setGameState(engine.getState())
    setCurrentWord('')
  }

  const handleClearPath = () => {
    engine.clearPath()
    setGameState(engine.getState())
    setCurrentWord('')
  }

  const handleReset = () => {
    engine.reset()
    initializeGame()
    setCurrentWord('')
    setFoundMessage(null)
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">AI正在生成游戏...</p>
          <p className="text-sm text-gray-500 mt-2">这可能需要几秒钟</p>
        </div>
      </div>
    )
  }

  if (generateError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-4">生成游戏失败</p>
          <p className="text-sm text-gray-600 mb-6">{generateError}</p>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {/* 顶部信息栏 */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-800">{gameState.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={`w-6 h-6 ${gameState.timeRemaining <= 30 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
            <span className={`text-2xl font-bold ${gameState.timeRemaining <= 30 ? 'text-red-500' : 'text-gray-800'}`}>
              {Math.floor(gameState.timeRemaining / 60)}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">找到单词</div>
            <div className="text-lg font-bold text-gray-800">
              {gameState.foundWords.length}/{gameState.allWords.length}
            </div>
          </div>
        </div>

        {/* 已找到的单词列表 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {gameState.foundWords.map((word) => (
            <motion.span
              key={word}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>

      {/* 当前单词显示 */}
      <AnimatePresence>
        {currentWord && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="mb-4 flex items-center gap-3"
          >
            <span className="text-3xl font-bold text-blue-600">{currentWord}</span>
            <button
              onClick={handleSubmitWord}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearPath}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 找到/无效单词提示 */}
      <AnimatePresence>
        {foundMessage && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="mb-4 text-lg font-semibold"
          >
            {foundMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 字母网格 */}
      <div
        className="grid gap-2 mb-6"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {gameState.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`
                w-16 h-16 rounded-xl font-bold text-2xl transition-all
                ${
                  cell.selected
                    ? 'bg-blue-500 text-white scale-110 shadow-lg'
                    : cell.inPath
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }
                ${gameState.isGameOver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              disabled={gameState.isGameOver}
            >
              {cell.letter}
            </button>
          ))
        )}
      </div>

      {/* 底部按钮 */}
      {!gameState.isGameOver && (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          重新开始
        </button>
      )}

      {/* 游戏结束 */}
      {gameState.isGameOver && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">游戏结束!</h2>
          <p className="text-xl text-gray-600 mb-2">
            得分: <span className="font-bold text-blue-600">{gameState.score}</span>
          </p>
          <p className="text-lg text-gray-600 mb-6">
            找到 {gameState.foundWords.length} / {gameState.allWords.length} 个单词
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors mx-auto"
          >
            <RotateCcw className="w-6 h-6" />
            再玩一次
          </button>
        </motion.div>
      )}
    </div>
  )
}
