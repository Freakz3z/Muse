/**
 * 游戏中心页面
 * 展示所有可用的游戏模式和管理单词库
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft,
  Flame,
  Star,
  Zap,
  Crown,
  BookOpen,
  Sparkles,
  TrendingUp,
  Grid3x3,
} from 'lucide-react'
import LetterLinkGame from '../components/games/LetterLinkGame'

interface GameMode {
  id: string
  title: string
  description: string
  icon: React.ElementType
  iconBg: string
  gradient: string
  route: string
  status: 'available' | 'coming-soon'
  tags: string[]
}

interface WordLibrary {
  words: Array<{
    word: string
    hint?: string
    learnedAt: number
  }>
}

const gameModes: GameMode[] = [
  {
    id: 'letter-link',
    title: '字母连线',
    description: '连接相邻字母组成单词，AI智能生成关卡',
    icon: Grid3x3,
    iconBg: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    route: 'letter-link',
    status: 'available',
    tags: ['单词', '益智', 'AI生成'],
  },
  {
    id: 'speed-challenge',
    title: '极速挑战',
    description: '限时答题，挑战反应速度极限',
    icon: Zap,
    iconBg: 'from-yellow-500 to-orange-500',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    route: '#',
    status: 'coming-soon',
    tags: ['速度', '反应'],
  },
  {
    id: 'boss-battle',
    title: 'BOSS战',
    description: '每10题一个BOSS，击败强大对手',
    icon: Crown,
    iconBg: 'from-amber-500 to-yellow-500',
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    route: '#',
    status: 'coming-soon',
    tags: ['挑战', '策略'],
  },
  {
    id: 'endless-mode',
    title: '无尽模式',
    description: '无限挑战，追求极限高分',
    icon: Trophy,
    iconBg: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    route: '#',
    status: 'coming-soon',
    tags: ['无尽', '高分'],
  },
  {
    id: 'pvp-arena',
    title: '竞技场',
    description: '与好友实时PK，争夺荣耀',
    icon: Flame,
    iconBg: 'from-red-500 to-pink-500',
    gradient: 'from-red-500 via-pink-500 to-purple-500',
    route: '#',
    status: 'coming-soon',
    tags: ['对战', '社交'],
  },
  {
    id: 'daily-quiz',
    title: '每日挑战',
    description: '每天更新的专属挑战题目',
    icon: Target,
    iconBg: 'from-green-500 to-emerald-500',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    route: '#',
    status: 'coming-soon',
    tags: ['每日', '奖励'],
  },
]

function GameCard({
  game,
  onClick,
}: {
  game: GameMode
  onClick?: () => void
}) {
  const Icon = game.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative overflow-hidden rounded-2xl shadow-lg
        ${game.status === 'available' && onClick ? 'cursor-pointer' : 'opacity-60'}
      `}
      onClick={game.status === 'available' ? onClick : undefined}
    >
      {game.status === 'available' ? (
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 h-full">
          {/* 背景 */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-10`}
          />

          {/* 内容 */}
          <div className="relative">
            {/* 图标 */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.iconBg} flex items-center justify-center mb-4 shadow-lg`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* 标题和描述 */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {game.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {game.description}
            </p>

            {/* 标签 */}
            <div className="flex gap-2 mb-4">
              {game.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 进入按钮 */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
              <span>开始游戏</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 h-full">
          {/* 背景 */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-5`}
          />

          {/* 内容 */}
          <div className="relative">
            {/* 图标 */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.iconBg} flex items-center justify-center mb-4 shadow-lg opacity-50`}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* 标题和描述 */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {game.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {game.description}
            </p>

            {/* 标签 */}
            <div className="flex gap-2 mb-4">
              {game.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 即将推出 */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Star className="w-4 h-4" />
              <span>即将推出</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function GameHub() {
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState<'hub' | 'letter-link'>('hub')
  const [wordLibrary, setWordLibrary] = useState<WordLibrary>({ words: [] })
  const [stats, setStats] = useState({
    totalWords: 0,
    totalGames: 0,
    totalScore: 0,
  })

  // 加载单词库和统计数据
  useEffect(() => {
    loadWordLibrary()
    loadStats()
  }, [])

  const loadWordLibrary = () => {
    try {
      const saved = localStorage.getItem('muse_game_word_library')
      if (saved) {
        setWordLibrary(JSON.parse(saved))
      }
    } catch (error) {
      console.error('加载单词库失败:', error)
    }
  }

  const loadStats = () => {
    try {
      const saved = localStorage.getItem('muse_game_stats')
      if (saved) {
        setStats(JSON.parse(saved))
      }
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  const saveToWordLibrary = (words: Array<{ word: string; hint?: string }>) => {
    const newWords = words.map(w => ({
      ...w,
      learnedAt: Date.now(),
    }))

    // 合并到现有单词库，去重
    const existingWords = new Set(wordLibrary.words.map(w => w.word))
    const uniqueNewWords = newWords.filter(w => !existingWords.has(w.word))

    const updatedLibrary = {
      words: [...wordLibrary.words, ...uniqueNewWords],
    }

    setWordLibrary(updatedLibrary)
    localStorage.setItem('muse_game_word_library', JSON.stringify(updatedLibrary))
  }

  const handleGameEnd = (result: {
    foundWords: string[]
    allWords: Array<{ word: string; hint?: string }>
    score: number
  }) => {
    // 保存找到的单词到单词库
    const foundWordsWithHints = result.allWords.filter(w =>
      result.foundWords.includes(w.word)
    )
    saveToWordLibrary(foundWordsWithHints)

    // 更新统计数据
    const updatedStats = {
      totalWords: stats.totalWords + result.foundWords.length,
      totalGames: stats.totalGames + 1,
      totalScore: stats.totalScore + result.score,
    }
    setStats(updatedStats)
    localStorage.setItem('muse_game_stats', JSON.stringify(updatedStats))

    // 返回游戏中心
    setTimeout(() => {
      setCurrentView('hub')
    }, 2000)
  }

  const clearWordLibrary = () => {
    if (window.confirm('确定要清空单词库吗？此操作不可恢复。')) {
      setWordLibrary({ words: [] })
      localStorage.removeItem('muse_game_word_library')
    }
  }

  // 字母连线游戏视图
  if (currentView === 'letter-link') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between p-6 bg-white shadow-sm">
          <button
            onClick={() => setCurrentView('hub')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">返回游戏中心</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">字母连线</h1>
          <div className="w-32"></div>
        </div>

        {/* 游戏区域 */}
        <div className="flex-1 overflow-auto">
          <LetterLinkGame onGameEnd={handleGameEnd} />
        </div>
      </div>
    )
  }

  // 游戏中心主视图
  return (
    <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">返回首页</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎮 游戏中心
            </h1>
            <p className="text-gray-600">
              选择游戏模式，让学习变得更有趣！
            </p>
          </motion.div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {stats.totalWords}
                </div>
                <div className="text-sm text-gray-600">学会的单词</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {stats.totalGames}
                </div>
                <div className="text-sm text-gray-600">完成游戏</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {stats.totalScore}
                </div>
                <div className="text-sm text-gray-600">总得分</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 游戏列表 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">选择游戏</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard
                  game={game}
                  onClick={() => {
                    if (game.status === 'available') {
                      if (game.id === 'letter-link') {
                        setCurrentView('letter-link')
                      } else {
                        navigate(game.route)
                      }
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 单词库 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">我的单词库</h2>
            {wordLibrary.words.length > 0 && (
              <button
                onClick={clearWordLibrary}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                清空单词库
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {wordLibrary.words.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">单词库是空的</p>
                <p className="text-sm">完成游戏来收集单词吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                {wordLibrary.words
                  .sort((a, b) => b.learnedAt - a.learnedAt)
                  .map((item, index) => (
                    <motion.div
                      key={item.word}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {item.word}
                      </div>
                      {item.hint && (
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {item.hint}
                        </div>
                      )}
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 提示信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">游戏说明</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                通过游戏化学习，让背单词变得更有趣！每个游戏模式都有独特的玩法和挑战。
                完成游戏可以将找到的单词保存到单词库，方便后续复习。
                更多游戏模式正在开发中，敬请期待！
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
