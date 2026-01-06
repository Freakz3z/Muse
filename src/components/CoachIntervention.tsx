/**
 * AI教练干预提示组件
 *
 * 显示AI学习教练的建议和干预
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Zap, Trophy, Lightbulb, X } from 'lucide-react'
import type { CoachIntervention } from '../services/ai-core'

interface CoachInterventionProps {
  intervention: CoachIntervention
  onDismiss: () => void
  onAction?: () => void
}

export default function CoachInterventionCard({
  intervention,
  onDismiss,
  onAction,
}: CoachInterventionProps) {
  const getIcon = () => {
    switch (intervention.type) {
      case 'rest':
        return <Coffee className="w-6 h-6" />
      case 'difficulty':
        return <Zap className="w-6 h-6" />
      case 'achievement':
        return <Trophy className="w-6 h-6" />
      case 'motivation':
        return <Lightbulb className="w-6 h-6" />
      default:
        return <Lightbulb className="w-6 h-6" />
    }
  }

  const getStyles = () => {
    switch (intervention.type) {
      case 'rest':
        return {
          bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
        }
      case 'difficulty':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-pink-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
        }
      case 'achievement':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
        }
      case 'motivation':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
        }
    }
  }

  const styles = getStyles()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`${styles.bg} ${styles.border} border-2 rounded-xl p-5 shadow-lg`}
      >
        <div className="flex items-start gap-4">
          {/* 图标 */}
          <div className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-xl flex-shrink-0`}>
            {getIcon()}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${styles.titleColor} mb-2`}>
                  {intervention.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {intervention.message}
                </p>
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 操作按钮 */}
            {intervention.actionable && intervention.actionLabel && (
              <div className="mt-3">
                <button
                  onClick={() => {
                    intervention.action?.()
                    onAction?.()
                    onDismiss()
                  }}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm border border-gray-200 shadow-sm hover:shadow transition-all"
                >
                  {intervention.actionLabel}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 优先级指示器 */}
        {intervention.priority === 'high' && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>重要建议</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
