/**
 * Buff详情模态框组件
 * 显示单个Buff的详细信息
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getBuffDisplay } from '../../data/card-buffs'
import type { Buff } from '../../types/card-game'

interface BuffDetailModalProps {
  buff: Buff | null
  isOpen: boolean
  onClose: () => void
}

export default function BuffDetailModal({
  buff,
  isOpen,
  onClose,
}: BuffDetailModalProps) {
  if (!buff || !isOpen) return null

  const display = getBuffDisplay(buff)

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
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors z-10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* 卡牌头部 */}
                <div
                  className={`relative p-8 bg-gradient-to-br ${display.rarityGradient}`}
                  style={{
                    background: display.rarityGradient.includes('from')
                      ? undefined
                      : `linear-gradient(135deg, ${display.rarityColor}, ${display.rarityColor}dd)`,
                  }}
                >
                  {/* 光晕效果 */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `radial-gradient(circle at center, ${display.rarityColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* 内容 */}
                  <div className="relative text-center">
                    {/* 图标 */}
                    <div className="text-7xl mb-4">{display.icon}</div>

                    {/* 名称 */}
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {display.name}
                    </h2>

                    {/* 稀有度标签 */}
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      {display.rarity === 'common' && '普通卡牌'}
                      {display.rarity === 'rare' && '稀有卡牌'}
                      {display.rarity === 'epic' && '史诗卡牌'}
                      {display.rarity === 'legendary' && '传说卡牌'}
                    </span>
                  </div>
                </div>

                {/* 详情内容 */}
                <div className="p-6 space-y-4">
                  {/* 描述 */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                      效果描述
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {display.description}
                    </p>
                  </div>

                  {/* 属性信息 */}
                  <div className="grid grid-cols-2 gap-3">
                    {buff.duration && (
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">⏱️</div>
                        <div className="text-sm text-gray-600">持续回合</div>
                        <div className="text-xl font-bold text-blue-600">
                          {buff.duration}
                        </div>
                      </div>
                    )}
                    {buff.value && !buff.duration && (
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">📊</div>
                        <div className="text-sm text-gray-600">效果数值</div>
                        <div className="text-xl font-bold text-green-600">
                          {buff.value}
                        </div>
                      </div>
                    )}
                    <div
                      className={`rounded-xl p-3 text-center ${
                        buff.isPositive ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {buff.isPositive ? '✅' : '⚠️'}
                      </div>
                      <div className="text-sm text-gray-600">类型</div>
                      <div
                        className={`text-sm font-bold ${
                          buff.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {buff.isPositive ? '正面效果' : '负面效果'}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm text-gray-600">稀有度</div>
                      <div className="text-sm font-bold text-purple-600">
                        {display.rarity === 'common' && '普通'}
                        {display.rarity === 'rare' && '稀有'}
                        {display.rarity === 'epic' && '史诗'}
                        {display.rarity === 'legendary' && '传说'}
                      </div>
                    </div>
                  </div>

                  {/* 使用提示 */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">使用提示：</span>
                        {!buff.isPositive
                          ? ' 这是一个负面效果卡牌！使用后会对你的游戏造成不利影响，建议谨慎使用。'
                          : buff.type === 'double_score' ||
                              buff.type === 'combo_boost'
                            ? ' 在连击较高时使用可以获得更高的分数加成！'
                            : buff.type === 'shield'
                            ? ' 在不确定答案时使用，可以保护你的连击不被中断。'
                            : buff.type === 'extra_time'
                            ? ' 在游戏后期时间紧张时使用效果最佳。'
                            : buff.type === 'lucky_card'
                            ? ' 遇到特别困难的题目时可以使用跳过。'
                            : ' 根据当前题目情况灵活使用。'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 底部按钮 */}
                <div className="px-6 pb-6">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    知道了
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
