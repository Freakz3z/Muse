import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  BookOpen,
  RefreshCw,
  Award,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Clock,
  Loader2,
  CheckCircle2,
  Star
} from 'lucide-react'
import { useAppStore } from '../store'
import { statsStorage } from '../storage'
import { StudyStats, MasteryLevel } from '../types'
import StatCard from '../components/StatCard'
import { aiService } from '../services/ai'
import { StudySuggestion } from '../services/ai/types'

export default function Statistics() {
  const { records, todayStats, profile, words, currentBook } = useAppStore()
  const [weeklyStats, setWeeklyStats] = useState<StudyStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<StudyStats[]>([])
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<StudySuggestion | null>(null)

  useEffect(() => {
    loadStats()
    setIsConfigured(aiService.isConfigured())
  }, [])

  const loadStats = async () => {
    const stats = await statsStorage.getLast30Days()
    setMonthlyStats(stats)
    setWeeklyStats(stats.slice(-7))
  }

  // 计算学习统计数据（用于AI建议）
  const calculateAIStats = () => {
    const recordsArray = Array.from(records.values())
    
    const masteredWords = recordsArray.filter(r => r.easeFactor >= 2.5 && r.reviewCount >= 3).length
    const learningWords = recordsArray.filter(r => r.reviewCount > 0 && (r.easeFactor < 2.5 || r.reviewCount < 3)).length
    
    const now = Date.now()
    const reviewDueWords = recordsArray.filter(r => r.nextReviewAt <= now).length
    
    const totalReviews = recordsArray.reduce((sum: number, r) => sum + r.reviewCount, 0)
    const averageAccuracy = totalReviews > 0 
      ? recordsArray.reduce((sum: number, r) => sum + (r.easeFactor / 2.5), 0) / recordsArray.length
      : 0

    const studyDays = recordsArray.length > 0 
      ? Math.ceil((now - Math.min(...recordsArray.map(r => r.lastReviewAt))) / (1000 * 60 * 60 * 24))
      : 0

    const weakRecords = recordsArray
      .filter(r => r.easeFactor < 2.0 || r.reviewCount <= 1)
      .slice(0, 10)
    const weakWords = weakRecords
      .map(r => words.find(w => w.id === r.wordId)?.word)
      .filter(Boolean) as string[]

    return {
      totalWords: currentBook?.wordCount || 0,
      masteredWords,
      learningWords,
      reviewDueWords,
      averageAccuracy: Math.min(averageAccuracy, 1),
      studyDays,
      weakWords,
    }
  }

  const handleGenerateSuggestion = async () => {
    if (!isConfigured) return
    
    setIsLoading(true)
    try {
      const stats = calculateAIStats()
      const result = await aiService.generateStudySuggestion(stats)
      setSuggestion(result)
    } catch (error) {
      console.error('生成学习建议失败:', error)
      alert('生成学习建议失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 计算掌握度分布
  const masteryDistribution = () => {
    const distribution = {
      '新词': 0,
      '学习中': 0,
      '复习中': 0,
      '熟悉': 0,
      '已掌握': 0,
    }
    
    records.forEach(record => {
      switch (record.masteryLevel) {
        case MasteryLevel.NEW:
          distribution['新词']++
          break
        case MasteryLevel.LEARNING:
          distribution['学习中']++
          break
        case MasteryLevel.REVIEWING:
          distribution['复习中']++
          break
        case MasteryLevel.FAMILIAR:
          distribution['熟悉']++
          break
        case MasteryLevel.MASTERED:
          distribution['已掌握']++
          break
      }
    })
    
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
  }

  const pieColors = ['#94a3b8', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981']

  // 计算本周总学习量
  const weeklyTotal = weeklyStats.reduce((sum, day) => sum + day.newWords + day.reviewedWords, 0)
  const weeklyNewWords = weeklyStats.reduce((sum, day) => sum + day.newWords, 0)
  const weeklyReviewWords = weeklyStats.reduce((sum, day) => sum + day.reviewedWords, 0)

  // 格式化日期用于图表
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const chartData = weeklyStats.map(stat => ({
    ...stat,
    date: formatDate(stat.date),
    total: stat.newWords + stat.reviewedWords,
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本周学习"
          value={weeklyTotal}
          subtitle="个单词"
          icon={<BookOpen className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="本周新学"
          value={weeklyNewWords}
          subtitle="个单词"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="本周复习"
          value={weeklyReviewWords}
          subtitle="个单词"
          icon={<RefreshCw className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="连续学习"
          value={profile?.streak || 0}
          subtitle="天"
          icon={<Award className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 学习趋势 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            近7天学习趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="newWords" 
                  name="新学" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorNew)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="reviewedWords" 
                  name="复习" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorReview)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 掌握度分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            单词掌握度分布
          </h3>
          <div className="h-64">
            {records.size > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={masteryDistribution()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {masteryDistribution().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 学习日历热力图简化版 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">近30天学习日历</h3>
        <div className="flex flex-wrap gap-2">
          {monthlyStats.map((stat, index) => {
            const total = stat.newWords + stat.reviewedWords
            const intensity = total === 0 ? 0 : total < 10 ? 1 : total < 20 ? 2 : total < 30 ? 3 : 4
            const colors = ['bg-gray-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500']
            
            return (
              <div
                key={index}
                className={`w-8 h-8 rounded ${colors[intensity]} flex items-center justify-center text-xs`}
                title={`${stat.date}: ${total}个单词`}
              >
                {total > 0 && <span className={intensity >= 3 ? 'text-white' : 'text-green-800'}>{total}</span>}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <span>少</span>
          <div className="w-4 h-4 rounded bg-gray-100" />
          <div className="w-4 h-4 rounded bg-green-200" />
          <div className="w-4 h-4 rounded bg-green-300" />
          <div className="w-4 h-4 rounded bg-green-400" />
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>多</span>
        </div>
      </div>

      {/* AI 学习建议板块 */}
      {isConfigured && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI 学习教练
            </h3>
            {!suggestion && !isLoading && (
              <button
                onClick={handleGenerateSuggestion}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                获取AI建议
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">AI 正在分析你的学习数据...</p>
            </div>
          ) : suggestion ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 总结 */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-5 text-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">学习总结</h4>
                    <p className="text-white/90 text-sm">{suggestion.summary}</p>
                  </div>
                </div>
              </div>

              {/* 优势与不足 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    你的优势
                  </h4>
                  <ul className="space-y-1.5">
                    {suggestion.strengths.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    待改进
                  </h4>
                  <ul className="space-y-1.5">
                    {suggestion.weaknesses.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-orange-500 mt-0.5">!</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 学习建议 */}
              <div className="bg-yellow-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  学习建议
                </h4>
                <div className="space-y-2">
                  {suggestion.recommendations.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 每日计划 */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  建议每日计划
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-blue-600">{suggestion.dailyPlan.newWords}</div>
                    <div className="text-xs text-gray-500">新词数量</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <RefreshCw className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-green-600">{suggestion.dailyPlan.reviewWords}</div>
                    <div className="text-xs text-gray-500">复习数量</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-purple-600">{suggestion.dailyPlan.practiceTime}</div>
                    <div className="text-xs text-gray-500">分钟/天</div>
                  </div>
                </div>
              </div>

              {/* 重点关注单词 */}
              {suggestion.focusWords && suggestion.focusWords.length > 0 && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-red-500" />
                    重点关注单词
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.focusWords.map((word, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-white text-red-600 rounded-lg text-xs font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 鼓励语 */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💪</span>
                  </div>
                  <p className="text-gray-700 text-sm font-medium">{suggestion.encouragement}</p>
                </div>
              </div>

              {/* 重新生成按钮 */}
              <div className="text-center pt-2">
                <button
                  onClick={handleGenerateSuggestion}
                  disabled={isLoading}
                  className="px-4 py-2 text-purple-600 hover:text-purple-700 text-sm font-medium inline-flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  重新生成建议
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="py-8 text-center">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">
                AI 将分析你的学习进度、正确率和薄弱点，<br />
                为你提供个性化的学习规划和建议
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
