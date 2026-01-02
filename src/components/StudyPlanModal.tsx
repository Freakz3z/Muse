import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Clock,
  Target,
  Calendar,
  BookOpen,
  Check,
} from 'lucide-react'
import { useAppStore } from '../store'
import { aiService } from '../services/ai'
import { StudyPlan } from '../services/ai/types'

interface StudyPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onPlanCreated?: (plan: StudyPlan) => void
}

export default function StudyPlanModal({ isOpen, onClose, onPlanCreated }: StudyPlanModalProps) {
  const { studyPlan } = useAppStore()
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input')
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null)
  const [isViewingExisting, setIsViewingExisting] = useState(false)
  const [formData, setFormData] = useState({
    currentLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    studyGoal: '',
    availableTime: 30,
    targetDate: '',
    focusAreas: [] as string[],
  })

  // 当模态框打开时，如果有已有计划，设置为查看模式
  useEffect(() => {
    if (isOpen && studyPlan) {
      setIsViewingExisting(true)
      setStep('result')
      setGeneratedPlan(studyPlan)
    } else if (isOpen) {
      // 如果没有计划，重置为创建模式
      setIsViewingExisting(false)
      setStep('input')
      setGeneratedPlan(null)
    }
  }, [isOpen, studyPlan])

  const handleRegenerate = () => {
    setIsViewingExisting(false)
    setStep('input')
    setGeneratedPlan(null)
  }

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }))
  }

  const handleGenerate = async () => {
    if (!formData.studyGoal.trim()) {
      alert('请输入学习目标')
      return
    }

    setStep('loading')
    try {
      const plan = await aiService.generateStudyPlan({
        currentLevel: formData.currentLevel,
        studyGoal: formData.studyGoal,
        availableTime: formData.availableTime,
        targetDate: formData.targetDate || undefined,
        focusAreas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined,
      })

      setGeneratedPlan(plan)
      setStep('result')
      onPlanCreated?.(plan)
    } catch (error) {
      console.error('生成学习计划失败:', error)
      alert('生成学习计划失败，请检查 AI 配置后重试')
      setStep('input')
    }
  }

  const handleApply = async () => {
    if (generatedPlan) {
      await useAppStore.getState().saveStudyPlan(generatedPlan)
      onClose()
    }
  }

  const focusAreaOptions = [
    '日常词汇', '商务英语', '学术词汇', '旅游英语',
    '科技词汇', '医学词汇', '法律词汇', '文学词汇'
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {step === 'input' ? '创建 AI 学习计划' :
                 step === 'loading' ? 'AI 正在规划...' :
                 '你的专属学习计划'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {step === 'input' && (
              <div className="space-y-6">
                {/* 当前水平 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    当前英语水平
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'beginner', label: '初级', desc: '刚开始学习' },
                      { value: 'intermediate', label: '中级', desc: '有一定基础' },
                      { value: 'advanced', label: '高级', desc: '追求精通' },
                    ].map(level => (
                      <button
                        key={level.value}
                        onClick={() => setFormData(prev => ({ ...prev, currentLevel: level.value as any }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.currentLevel === level.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs mt-1 opacity-70">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 学习目标 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学习目标 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.studyGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, studyGoal: e.target.value }))}
                    placeholder="例如：通过大学英语六级考试、提升商务英语能力、准备出国留学..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 每日可用时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每日可用学习时间
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={10}
                      value={formData.availableTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, availableTime: Number(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg min-w-[120px] justify-center">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700">{formData.availableTime} 分钟</span>
                    </div>
                  </div>
                </div>

                {/* 目标完成日期 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    目标完成日期（可选）
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, targetDate: '' }))}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        !formData.targetDate
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">不设定</div>
                      <div className="text-xs opacity-70 mt-1">自由学习</div>
                    </button>
                    {[
                      { months: 1, label: '1个月', desc: '短期冲刺' },
                      { months: 3, label: '3个月', desc: '中期计划' },
                      { months: 6, label: '6个月', desc: '长期坚持' },
                    ].map(option => {
                      const date = new Date()
                      date.setMonth(date.getMonth() + option.months)
                      const dateStr = date.toISOString().split('T')[0]
                      const isSelected = formData.targetDate === dateStr

                      return (
                        <button
                          key={option.months}
                          onClick={() => setFormData(prev => ({ ...prev, targetDate: dateStr }))}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs opacity-70 mt-1">{option.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                  {formData.targetDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      目标日期：{formData.targetDate}
                    </p>
                  )}
                </div>

                {/* 重点领域 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    重点词汇领域（可多选）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {focusAreaOptions.map(area => (
                      <button
                        key={area}
                        onClick={() => handleFocusAreaToggle(area)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          formData.focusAreas.includes(area)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {formData.focusAreas.includes(area) && <Check className="w-3 h-3 inline mr-1" />}
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-500" />
                </div>
                <p className="mt-6 text-gray-600 font-medium">AI 正在为你制定专属学习计划...</p>
                <p className="text-sm text-gray-400 mt-2">这可能需要几秒钟</p>
              </div>
            )}

            {step === 'result' && generatedPlan && (
              <div className="space-y-4">
                {/* 计划概览 */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-5 text-white">
                  <h3 className="text-lg font-bold mb-2">{generatedPlan.planName}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{generatedPlan.totalWeeks}</div>
                      <div className="text-sm text-white/80">周计划</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{generatedPlan.dailyPlan.newWords}</div>
                      <div className="text-sm text-white/80">每日新词</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{generatedPlan.dailyPlan.studyTime}</div>
                      <div className="text-sm text-white/80">分钟/天</div>
                    </div>
                  </div>
                </div>

                {/* 每日计划 */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    每日学习安排
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm text-gray-500">新词学习</div>
                      <div className="text-xl font-bold text-blue-600">{generatedPlan.dailyPlan.newWords} 个</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm text-gray-500">复习巩固</div>
                      <div className="text-xl font-bold text-green-600">{generatedPlan.dailyPlan.reviewWords} 个</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    💡 建议时段：{generatedPlan.dailyPlan.bestTime}
                  </div>
                </div>

                {/* 重点领域 */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    重点关注领域
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedPlan.focusAreas.map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 学习策略 */}
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    学习策略
                  </h4>
                  <ul className="space-y-2">
                    {generatedPlan.strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span className="text-sm">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI 建议 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    AI 建议
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{generatedPlan.aiAdvice}</p>
                </div>

                {/* 预期结果 */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 预期效果</h4>
                  <p className="text-sm text-gray-600">{generatedPlan.expectedOutcome}</p>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            {step === 'input' && (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!formData.studyGoal.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  生成学习计划
                </button>
              </>
            )}
            {step === 'loading' && (
              <div className="text-sm text-gray-500">AI 正在分析你的学习需求...</div>
            )}
            {step === 'result' && (
              <>
                <button
                  onClick={handleRegenerate}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  {isViewingExisting ? '重新规划' : '重新规划'}
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isViewingExisting ? '确认' : '应用此计划'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
