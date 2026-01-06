import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
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
  BookOpen,
  RefreshCw,
  Award,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useAppStore } from '../store'
import { statsStorage } from '../storage'
import { StudyStats, MasteryLevel } from '../types'
import StatCard from '../components/StatCard'

export default function Statistics() {
  const { records, profile } = useAppStore()
  const [weeklyStats, setWeeklyStats] = useState<StudyStats[]>([])
  const [monthlyStats, setMonthlyStats] = useState<StudyStats[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const stats = await statsStorage.getLast30Days()
    setMonthlyStats(stats)
    setWeeklyStats(stats.slice(-7))
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

  // 计算词汇量增长趋势
  const growthData = () => {
    let cumulative = 0
    return monthlyStats.map(stat => {
      cumulative += stat.newWords
      return {
        date: formatDate(stat.date),
        count: cumulative
      }
    })
  }

  // 遗忘曲线预测 (未来7天)
  const forecastData = () => {
    const now = new Date()
    const forecast = []
    const recordsArray = Array.from(records.values())

    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 计算在该日期或之前需要复习的单词总数
      const count = recordsArray.filter(r => {
        const nextReview = new Date(r.nextReviewAt).toISOString().split('T')[0]
        return nextReview <= dateStr
      }).length

      forecast.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count
      })
    }
    return forecast
  }

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

      {/* AI画像入口 */}
      <Link
        to="/ai-profile"
        className="block bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-semibold mb-1">查看你的AI画像</h3>
              <p className="text-purple-100 text-sm">深度了解你的学习风格和记忆特征</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/80" />
        </div>
      </Link>

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

      {/* 深度分析图表 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 词汇量增长趋势 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            词汇量增长趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData()}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#9ca3af" fontSize={12} tick={{fill: '#9ca3af'}} />
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
                  dataKey="count" 
                  name="累计词汇量" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorGrowth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 遗忘曲线预测 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            遗忘曲线预测 (未来7天)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData()}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tick={{fill: '#9ca3af'}} />
                <YAxis stroke="#9ca3af" fontSize={12} tick={{fill: '#9ca3af'}} />
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
                  dataKey="count" 
                  name="待复习单词" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorForecast)" 
                />
              </AreaChart>
            </ResponsiveContainer>
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
    </div>
  )
}
