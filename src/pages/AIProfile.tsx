import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from 'recharts'
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  Heart,
  Lightbulb,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Network,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import { getProfileManager } from '../services/ai-core'
import type { AILearnerProfile } from '../types/learner-profile'

export default function AIProfile() {
  const [profile, setProfile] = useState<AILearnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const manager = getProfileManager()
      const userId = 'user_' + Date.now() // TODO: 从真实用户ID获取

      const loadedProfile = await manager.initialize(userId)
      setProfile(loadedProfile)
      setError(null)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('加载画像失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceUpdate = async () => {
    try {
      setIsUpdating(true)
      const manager = getProfileManager()
      await manager.forceUpdate()
      await loadProfile()
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">正在加载AI画像...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">{error || '无法加载画像'}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  // 准备认知风格雷达图数据
  const cognitiveData = [
    {
      subject: '视觉学习',
      value: profile.cognitiveStyle.visualLearner,
      fullMark: 1,
    },
    {
      subject: '语言学习',
      value: profile.cognitiveStyle.verbalLearner,
      fullMark: 1,
    },
    {
      subject: '情境学习',
      value: profile.cognitiveStyle.contextualLearner,
      fullMark: 1,
    },
  ]

  // 准备遗忘曲线数据
  const forgettingCurveData = profile.memoryPattern.forgettingCurve.map((value, index) => ({
    time: ['即时', '1天', '3天', '1周', '2周'][index] || `T${index}`,
    retention: value * 100,
    average: [100, 70, 50, 35, 25][index] || 0, // 艾宾浩斯平均曲线
  }))

  // 准备情感状态数据
  const emotionalData = [
    { name: '信心', value: profile.emotionalState.confidence * 100, color: '#10b981' },
    { name: '动机', value: profile.emotionalState.motivation * 100, color: '#8b5cf6' },
    { name: '心流', value: profile.emotionalState.flowScore * 100, color: '#3b82f6' },
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            我的AI画像
          </h1>
          <p className="text-gray-500 mt-1">深度理解你的学习特征，实现真正的个性化学习</p>
        </div>
        <button
          onClick={handleForceUpdate}
          disabled={isUpdating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? '更新中...' : '刷新画像'}
        </button>
      </div>

      {/* 画像质量提示 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">
              画像版本 v{profile.version} · 最后更新 {new Date(profile.lastUpdated).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              已学习 {profile.knowledgeGraph.vocabularySize} 个单词 · AI已分析你的学习模式
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* 学习统计入口 */}
      <Link
        to="/statistics"
        className="block bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-1">查看学习统计</h3>
              <p className="text-blue-100 text-sm">了解你的学习进度和成果</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/80" />
        </div>
      </Link>

      {/* 6维画像卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. 认知风格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">认知风格</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            了解你如何最有效地接收和记忆信息
          </p>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={cognitiveData} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 1]}
                  tick={false}  // 隐藏数字刻度
                  tickCount={5}
                />
                <Radar
                  name="学习倾向"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {profile.cognitiveStyle.visualLearner > 0.6 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-500">●</span>
                <span className="text-gray-600">视觉学习者：图片和图表对你更有效</span>
              </div>
            )}
            {profile.cognitiveStyle.contextualLearner > 0.6 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-500">●</span>
                <span className="text-gray-600">情境学习者：需要丰富的上下文</span>
              </div>
            )}
            {profile.cognitiveStyle.verbalLearner > 0.6 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">●</span>
                <span className="text-gray-600">语言学习者：文字解释最适合你</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 2. 记忆特征 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">记忆特征</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            个性化的遗忘曲线和最优复习间隔
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={forgettingCurveData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                stroke="#e5e7eb"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={false}  // 隐藏Y轴数字
                stroke="#e5e7eb"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`${value.toFixed(0)}%`, '保留率']}
              />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="你的记忆"
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                dot={false}
                name="平均记忆"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">最佳复习间隔</p>
              <p className="text-lg font-semibold text-blue-600">
                {profile.memoryPattern.optimalReviewInterval}小时
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">记忆稳定性</p>
              <p className="text-lg font-semibold text-green-600">
                {(profile.memoryPattern.memoryStability * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* 3. 学习行为 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">学习行为</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            你的学习习惯和最佳时段
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">最佳学习时段</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                {
                  {
                    morning: '早晨',
                    afternoon: '下午',
                    evening: '晚上',
                    night: '深夜',
                  }[profile.behaviorPattern.preferredStudyTime]
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">习惯学习时长</span>
              <span className="font-semibold text-gray-800">
                {profile.behaviorPattern.sessionDuration}分钟
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">平均反应时间</span>
              <span className="font-semibold text-gray-800">
                {(profile.behaviorPattern.responseTime / 1000).toFixed(1)}秒
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">学习一致性</span>
              <span className="font-semibold text-gray-800">
                {(profile.behaviorPattern.consistency * 100).toFixed(0)}%
              </span>
            </div>
            {profile.behaviorPattern.errorPatterns.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">易错模式</p>
                <div className="flex flex-wrap gap-2">
                  {profile.behaviorPattern.errorPatterns.map((pattern, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 4. 知识图谱 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">知识图谱</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            已掌握的领域和知识网络
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">词汇量</span>
                <span className="text-lg font-bold text-green-600">
                  {profile.knowledgeGraph.vocabularySize}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (profile.knowledgeGraph.vocabularySize /
                        profile.learningGoals.targetVocabularySize) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            {profile.knowledgeGraph.masteredDomains.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">已掌握领域</p>
                <div className="flex flex-wrap gap-2">
                  {profile.knowledgeGraph.masteredDomains.map((domain, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.knowledgeGraph.weakDomains.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">薄弱领域</p>
                <div className="flex flex-wrap gap-2">
                  {profile.knowledgeGraph.weakDomains.map((domain, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 5. 情感状态 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-800">当前状态</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            实时监控你的学习情绪和心流状态
          </p>
          <div className="space-y-3">
            {emotionalData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: item.color }}>
                    {item.value.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              {profile.emotionalState.flowScore > 0.7 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>你处于心流状态，学习效果最佳！</span>
                </div>
              )}
              {profile.emotionalState.frustration > 0.6 && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>检测到挫败感，建议休息或降低难度</span>
                </div>
              )}
              {profile.emotionalState.motivation < 0.4 && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Lightbulb className="w-4 h-4" />
                  <span>动机较低，试试学习新领域或增加趣味性</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 6. 学习目标 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800">学习目标</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            追踪进度到目标的距离
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">目标水平</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                  {profile.learningGoals.targetLevel.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">进度</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {(profile.learningGoals.progressToGoal * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${profile.learningGoals.progressToGoal * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">当前词汇量</p>
                <p className="text-lg font-bold text-indigo-600">
                  {profile.knowledgeGraph.vocabularySize}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">目标词汇量</p>
                <p className="text-lg font-bold text-purple-600">
                  {profile.learningGoals.targetVocabularySize}
                </p>
              </div>
            </div>
            {profile.learningGoals.daysToDeadline > 0 && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">距离目标</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {profile.learningGoals.daysToDeadline}天
                  </span>
                </div>
              </div>
            )}
            {profile.learningGoals.priorityTopics.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-2">优先主题</p>
                <div className="flex flex-wrap gap-2">
                  {profile.learningGoals.priorityTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 底部提示 */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2">AI画像会持续进化</h3>
            <p className="text-purple-100 text-sm">
              随着你的学习，AI会不断更新你的画像，提供越来越精准的个性化建议。
              每5个学习事件会触发一次AI分析，确保画像始终反映你的最新状态。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
