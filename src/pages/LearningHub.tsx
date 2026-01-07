/**
 * 学习中心页面
 * 整合学习、复习、测验三大核心功能
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  RotateCcw,
  Target,
  ArrowRight,
  Quote,
  Library,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../store'

// 本地励志名言库（避免 CSP 问题）
const localQuotes = [
  { text: '学习是唯一的归途，知识改变命运。', from: 'Muse' },
  { text: '不积跬步，无以至千里；不积小流，无以成江海。', from: '荀子' },
  { text: '书山有路勤为径，学海无涯苦作舟。', from: '韩愈' },
  { text: '读书破万卷，下笔如有神。', from: '杜甫' },
  { text: '学而不思则罔，思而不学则殆。', from: '孔子' },
  { text: '路漫漫其修远兮，吾将上下而求索。', from: '屈原' },
  { text: '业精于勤，荒于嬉；行成于思，毁于随。', from: '韩愈' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', from: '陆游' },
  { text: '少壮不努力，老大徒伤悲。', from: '长歌行' },
  { text: '黑发不知勤学早，白首方悔读书迟。', from: '颜真卿' },
]

type TabType = 'learn' | 'review' | 'quiz'

interface TabConfig {
  id: TabType
  title: string
  description: string
  icon: React.ElementType
  color: string
  route: string
  badge?: string
}

const tabs: TabConfig[] = [
  {
    id: 'learn',
    title: '学习',
    description: '学习新单词',
    icon: BookOpen,
    color: 'blue',
    route: '/learn',
  },
  {
    id: 'review',
    title: '复习',
    description: '巩固已学内容',
    icon: RotateCcw,
    color: 'green',
    route: '/review',
  },
  {
    id: 'quiz',
    title: '测验',
    description: '检验学习成果',
    icon: Target,
    color: 'purple',
    route: '/quiz',
  },
]

export default function LearningHub() {
  const { settings, updateSettings } = useAppStore()
  const [quote, setQuote] = useState(localQuotes[0])

  useEffect(() => {
    // 随机选择一条名言
    const randomIndex = Math.floor(Math.random() * localQuotes.length)
    setQuote(localQuotes[randomIndex])
  }, [])

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📚 学习中心
          </h1>
          <p className="text-gray-600">
            学习、复习、测验，一站式完成你的英语学习计划
          </p>
        </motion.div>

        {/* 学习模式选择 */}
        <div className="grid md:grid-cols-3 gap-4">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const colorClasses = {
              blue: { bg: 'bg-blue-50', text: 'text-blue-500' },
              green: { bg: 'bg-green-50', text: 'text-green-500' },
              purple: { bg: 'bg-purple-50', text: 'text-purple-500' },
            }
            const colors = colorClasses[tab.color as keyof typeof colorClasses]

            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={tab.route} className="block">
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 ${colors.bg} rounded-xl`}>
                          <Icon className={`w-8 h-8 ${colors.text}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {tab.title}
                            </h3>
                            {tab.badge && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                                {tab.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {tab.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:${colors.text} group-hover:translate-x-1 transition-all`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* 快捷入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/wordbook" className="block">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Library className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">词库管理</h3>
                    <p className="text-gray-500 text-sm">浏览和管理单词词库</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 学习设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* 每日学习目标 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">每日学习目标</h3>
                <p className="text-gray-500 text-sm">每天新学单词的数量</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">📚</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => updateSettings({ dailyGoal: Math.max(5, settings.dailyGoal - 5) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">−</span>
              </button>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{settings.dailyGoal}</div>
                <div className="text-xs text-gray-500 mt-1">个/天</div>
              </div>

              <button
                onClick={() => updateSettings({ dailyGoal: Math.min(100, settings.dailyGoal + 5) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">+</span>
              </button>
            </div>

            {/* 预设选项 */}
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((value) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ dailyGoal: value })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    settings.dailyGoal === value
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* 快速复习数量 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">快速复习数量</h3>
                <p className="text-gray-500 text-sm">每次快速复习的单词数</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <span className="text-violet-600 font-bold text-lg">⚡</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => updateSettings({ quickReviewLimit: Math.max(10, (settings.quickReviewLimit || 30) - 10) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">−</span>
              </button>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{settings.quickReviewLimit || 30}</div>
                <div className="text-xs text-gray-500 mt-1">个/次</div>
              </div>

              <button
                onClick={() => updateSettings({ quickReviewLimit: Math.min(100, (settings.quickReviewLimit || 30) + 10) })}
                className="w-10 h-10 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-all flex items-center justify-center"
              >
                <span className="text-lg font-semibold">+</span>
              </button>
            </div>

            {/* 预设选项 */}
            <div className="flex gap-2">
              {[20, 30, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ quickReviewLimit: value })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    settings.quickReviewLimit === value
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 一言 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Quote className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{quote.text}"
              </p>
              <p className="text-gray-400 text-xs mt-2 text-right">
                —— {quote.from}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
