import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Target,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Clock,
  BookOpen,
  RefreshCw,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react'
import { useAppStore } from '../store'
import { aiService } from '../services/ai'
import { StudySuggestion } from '../services/ai/types'

export default function AICoachPage() {
  const { words, records, currentBook } = useAppStore()
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<StudySuggestion | null>(null)

  useEffect(() => {
    setIsConfigured(aiService.isConfigured())
  }, [])

  // 计算学习统计数据
  const calculateStats = () => {
    // 将 Map 转换为数组
    const recordsArray = Array.from(records.values())
    
    const masteredWords = recordsArray.filter(r => r.easeFactor >= 2.5 && r.reviewCount >= 3).length
    const learningWords = recordsArray.filter(r => r.reviewCount > 0 && (r.easeFactor < 2.5 || r.reviewCount < 3)).length
    
    const now = Date.now()
    const reviewDueWords = recordsArray.filter(r => r.nextReviewAt <= now).length
    
    // 计算正确率
    const totalReviews = recordsArray.reduce((sum: number, r) => sum + r.reviewCount, 0)
    const averageAccuracy = totalReviews > 0 
      ? recordsArray.reduce((sum: number, r) => sum + (r.easeFactor / 2.5), 0) / recordsArray.length
      : 0

    // 计算学习天数（简化计算）
    const studyDays = recordsArray.length > 0 
      ? Math.ceil((now - Math.min(...recordsArray.map(r => r.lastReviewAt))) / (1000 * 60 * 60 * 24))
      : 0

    // 找出薄弱单词
    const weakRecords = recordsArray
      .filter(r => r.easeFactor < 2.0 || r.reviewCount <= 1)
      .slice(0, 10)
    const weakWords = weakRecords
      .map(r => words.find(w => w.id === r.wordId)?.word)
      .filter(Boolean) as string[]

    return {
      totalWords: words.length,
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
      const stats = calculateStats()
      const result = await aiService.generateStudySuggestion(stats)
      setSuggestion(result)
    } catch (error) {
      console.error('生成学习建议失败:', error)
      alert('生成学习建议失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 未配置 AI
  if (!isConfigured) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI 学习教练</h2>
          <p className="text-gray-600 mb-6">
            需要配置 AI 服务后才能获取个性化学习建议。<br />
            AI 将分析你的学习数据，提供专属的学习规划。
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

  const stats = calculateStats()

  return (
    <div className="max-w-3xl mx-auto">
      {/* 头部 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">AI 学习教练</h1>
        <p className="text-gray-500">
          基于你的学习数据，AI 为你提供个性化的学习建议
        </p>
      </div>

      {/* 学习数据概览 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          学习数据概览
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalWords}</div>
            <div className="text-sm text-gray-500">总单词</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.masteredWords}</div>
            <div className="text-sm text-gray-500">已掌握</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.learningWords}</div>
            <div className="text-sm text-gray-500">学习中</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.reviewDueWords}</div>
            <div className="text-sm text-gray-500">待复习</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            当前词库：<span className="text-gray-700 font-medium">{currentBook?.name || '未选择'}</span>
          </span>
          <span className="text-gray-500">
            累计学习：<span className="text-gray-700 font-medium">{stats.studyDays} 天</span>
          </span>
        </div>
      </div>

      {/* 生成建议按钮或建议内容 */}
      {!suggestion ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {isLoading ? (
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">AI 正在分析你的学习数据...</p>
            </div>
          ) : (
            <>
              <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">获取 AI 学习建议</h3>
              <p className="text-gray-500 mb-6">
                AI 将分析你的学习进度、正确率和薄弱点，<br />
                为你提供个性化的学习规划和建议
              </p>
              <button
                onClick={handleGenerateSuggestion}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                生成学习建议
              </button>
            </>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 总结 */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">学习总结</h3>
                <p className="text-white/90">{suggestion.summary}</p>
              </div>
            </div>
          </div>

          {/* 优势与不足 */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                你的优势
              </h3>
              <ul className="space-y-2">
                {suggestion.strengths.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                待改进
              </h3>
              <ul className="space-y-2">
                {suggestion.weaknesses.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-orange-500 mt-1">!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 学习建议 */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              学习建议
            </h3>
            <div className="space-y-3">
              {suggestion.recommendations.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                  <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 每日计划 */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              建议每日计划
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{suggestion.dailyPlan.newWords}</div>
                <div className="text-sm text-gray-500">新词数量</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <RefreshCw className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{suggestion.dailyPlan.reviewWords}</div>
                <div className="text-sm text-gray-500">复习数量</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{suggestion.dailyPlan.practiceTime}</div>
                <div className="text-sm text-gray-500">分钟/天</div>
              </div>
            </div>
          </div>

          {/* 重点关注单词 */}
          {suggestion.focusWords && suggestion.focusWords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                重点关注单词
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestion.focusWords.map((word, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 鼓励语 */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💪</span>
              </div>
              <p className="text-gray-700 font-medium">{suggestion.encouragement}</p>
            </div>
          </div>

          {/* 重新生成按钮 */}
          <div className="text-center">
            <button
              onClick={handleGenerateSuggestion}
              disabled={isLoading}
              className="px-6 py-2 text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              重新生成建议
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
