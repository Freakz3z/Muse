import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  RefreshCw,
  Flame,
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  Target,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store'
import StatCard from '../components/StatCard'
import StudyPlanModal from '../components/StudyPlanModal'

export default function Home() {
  const { profile, todayStats, settings, records, currentBook, getWordsToReview, studyPlan } = useAppStore()
  const [greeting, setGreeting] = useState('')
  const [reviewCount, setReviewCount] = useState(0)
  const [showPlanModal, setShowPlanModal] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('早上好')
    else if (hour < 18) setGreeting('下午好')
    else setGreeting('晚上好')
  }, [])

  useEffect(() => {
    const loadReviewCount = async () => {
      const dueWords = await getWordsToReview()
      setReviewCount(dueWords.length)
    }
    loadReviewCount()
  }, [records, getWordsToReview])

  const dailyProgress = todayStats.newWords + todayStats.reviewedWords
  const totalMastered = Array.from(records.values()).filter(r => r.masteryLevel >= 3).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 欢迎卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {greeting}，{profile?.nickname || '学习者'} 👋
            </h1>
            <p className="text-white/80">
              {profile?.streak ? (
                <>已连续学习 <span className="font-bold text-yellow-300">{profile.streak}</span> 天，继续保持！</>
              ) : (
                '开始今天的学习之旅吧！'
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="font-bold">{profile?.streak || 0} 天</span>
            </div>
          </div>
        </div>

        {/* 今日进度 */}
        <div className="mt-6 bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80">今日学习进度</span>
            <span className="font-bold">{dailyProgress} / {settings.dailyGoal}</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (dailyProgress / settings.dailyGoal) * 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="今日新学"
            value={todayStats.newWords}
            subtitle="个单词"
            icon={<BookOpen className="w-5 h-5" />}
            color="blue"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="今日复习"
            value={todayStats.reviewedWords}
            subtitle="个单词"
            icon={<RefreshCw className="w-5 h-5" />}
            color="green"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="已掌握"
            value={totalMastered}
            subtitle="个单词"
            icon={<Trophy className="w-5 h-5" />}
            color="purple"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="学习时长"
            value={todayStats.studyTime}
            subtitle="分钟"
            icon={<Clock className="w-5 h-5" />}
            color="orange"
          />
        </motion.div>
      </div>

      {/* 快捷入口 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 开始学习 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/learn">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">开始学习</h3>
                    <p className="text-gray-500 text-sm">
                      {currentBook ? `当前词库: ${currentBook.name}` : '选择词库开始学习'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* 待复习 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/review">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <RefreshCw className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">复习单词</h3>
                    <p className="text-gray-500 text-sm">
                      {reviewCount > 0 ? `${reviewCount} 个单词待复习` : '暂无待复习单词'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* AI 智能学习计划 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        {studyPlan ? (
          // 有学习计划时显示计划卡片
          <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{studyPlan.planName}</h3>
                  <p className="text-sm text-white/80">
                    第 {studyPlan.currentWeek} / {studyPlan.totalWeeks} 周
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                查看详情
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{studyPlan.dailyPlan.newWords}</div>
                <div className="text-xs text-white/80">今日新词</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{studyPlan.dailyPlan.reviewWords}</div>
                <div className="text-xs text-white/80">今日复习</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{studyPlan.dailyPlan.studyTime}</div>
                <div className="text-xs text-white/80">分钟/天</div>
              </div>
            </div>

            {/* 本周目标 */}
            {studyPlan.weeklyGoals[studyPlan.currentWeek - 1] && (
              <div className="mt-4 bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">本周目标：</span>
                  <span className="text-white/90">
                    {studyPlan.weeklyGoals[studyPlan.currentWeek - 1].description}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // 没有学习计划时显示创建卡片
          <button
            onClick={() => setShowPlanModal(true)}
            className="w-full bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-purple-300 hover:border-purple-400 hover:from-purple-100 hover:to-blue-100 transition-all group"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">创建 AI 学习计划</h3>
                <p className="text-sm text-gray-600">
                  AI 根据你的目标定制专属学习方案，科学规划学习进度
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        )}
      </motion.div>

      {/* 学习建议 - 当有 AI 学习计划时不显示 */}
      {!studyPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">今日学习建议</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {reviewCount > 0
                  ? `建议先复习 ${Math.min(reviewCount, 20)} 个待复习单词，巩固记忆后再学习新词。根据艾宾浩斯记忆曲线，及时复习可以大大提高记忆效率！`
                  : dailyProgress < settings.dailyGoal
                  ? `今日还需学习 ${settings.dailyGoal - dailyProgress} 个单词即可完成目标，加油！`
                  : '🎉 太棒了！今日学习目标已完成，可以适当休息或继续挑战更多单词！'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 学习计划模态框 */}
      <StudyPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onPlanCreated={(plan) => {
          useAppStore.getState().saveStudyPlan(plan)
        }}
      />
    </div>
  )
}
