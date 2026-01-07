/**
 * 游戏指南模态框组件
 * 显示详细的游戏规则和Buff介绍
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Sparkles, AlertTriangle } from 'lucide-react'
import { BUFF_DEFINITIONS } from '../../data/card-buffs'
import { BuffType, BuffRarity } from '../../types/card-game'

interface GameGuideProps {
  isOpen: boolean
  onClose: () => void
}

interface BuffInfo {
  type: BuffType
  name: string
  description: string
  rarity: BuffRarity
  duration?: number
  value?: number
  icon: string
  isPositive: boolean
}

export default function GameGuide({ isOpen, onClose }: GameGuideProps) {
  if (!isOpen) return null

  // 获取所有Buff定义
  const allBuffs: BuffInfo[] = Object.values(BUFF_DEFINITIONS).map((buff) => ({
    type: buff.type,
    name: buff.name,
    description: buff.description,
    rarity: buff.rarity,
    duration: buff.duration,
    value: buff.value,
    icon: buff.icon,
    isPositive: buff.isPositive,
  }))

  // 按稀有度和正负面分类
  const positiveBuffs = allBuffs.filter((b) => b.isPositive)
  const negativeBuffs = allBuffs.filter((b) => !b.isPositive)

  const getRarityColor = (rarity: BuffRarity) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500'
      case 'rare':
        return 'from-blue-400 to-blue-600'
      case 'epic':
        return 'from-purple-400 to-purple-600'
      case 'legendary':
        return 'from-yellow-400 to-orange-500'
    }
  }

  const getRarityLabel = (rarity: BuffRarity) => {
    switch (rarity) {
      case 'common':
        return '普通'
      case 'rare':
        return '稀有'
      case 'epic':
        return '史诗'
      case 'legendary':
        return '传说'
    }
  }

  const BuffCard = ({ buff }: { buff: BuffInfo }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl p-4 ${
        buff.isPositive ? 'bg-white' : 'bg-red-50'
      } border-2 shadow-sm`}
      style={{
        borderColor: buff.isPositive ? '#e5e7eb' : '#fca5a5',
      }}
    >
      {/* 背景 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(
          buff.rarity
        )} opacity-5`}
      />

      {/* 内容 */}
      <div className="relative">
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div
            className={`text-3xl flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${getRarityColor(
              buff.rarity
            )}`}
          >
            {buff.icon}
          </div>

          {/* 信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-800">{buff.name}</h4>
              {!buff.isPositive && (
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              {buff.description}
            </p>

            {/* 属性标签 */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full text-white font-medium bg-gradient-to-r ${getRarityColor(
                  buff.rarity
                )}`}
              >
                {getRarityLabel(buff.rarity)}
              </span>
              {buff.duration && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  持续 {buff.duration} 回合
                </span>
              )}
              {buff.value && !buff.duration && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  数值 {buff.value}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* 模态框 */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* 头部 */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">游戏指南</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* 内容 */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {/* 游戏规则 */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      游戏规则
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            目标
                          </h4>
                          <p className="text-sm text-gray-600">
                            在限定时间内完成尽可能多的题目，获取最高分！
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🃏</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            手牌系统
                          </h4>
                          <p className="text-sm text-gray-600">
                            游戏开始时获得3张随机Buff卡牌，使用后会自动抽取新卡。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            连击加成
                          </h4>
                          <p className="text-sm text-gray-600">
                            连续答对题目会累积连击，连击越高，得分加成越多（最多2倍）。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💎</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            稀有度系统
                          </h4>
                          <p className="text-sm text-gray-600">
                            卡牌分为普通、稀有、史诗、传说四个等级，稀有度越高，效果越强。
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 正面Buff */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      正面Buff
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {positiveBuffs.map((buff) => (
                        <BuffCard key={buff.type} buff={buff} />
                      ))}
                    </div>
                  </section>

                  {/* 负面Buff */}
                  <section className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">💀</span>
                      负面Buff
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {negativeBuffs.map((buff) => (
                        <BuffCard key={buff.type} buff={buff} />
                      ))}
                    </div>
                  </section>

                  {/* 提示 */}
                  <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      策略提示
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>
                          在连击较高时使用双倍积分卡，可以获得更高的分数
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>
                          护盾可以抵消一次错误，在不确定答案时使用
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>
                          时间加成卡在游戏后期使用更有效
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>
                          遇到困难题目时可以使用幸运卡跳过
                        </span>
                      </li>
                    </ul>
                  </section>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
