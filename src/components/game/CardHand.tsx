/**
 * 手牌区域组件
 * 显示当前可用的Buff卡牌
 */

import { motion, AnimatePresence } from 'framer-motion'
import BuffCard from './BuffCard'
import type { Buff } from '../../types/card-game'

interface CardHandProps {
  cards: Buff[]
  onCardUse: (buffId: string) => void
  disabled?: boolean
  maxSize?: number
}

export default function CardHand({
  cards,
  onCardUse,
  disabled = false,
  maxSize = 5,
}: CardHandProps) {
  const displayCards = cards.slice(0, maxSize)

  return (
    <div className="relative">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          命运手牌
        </h3>
        <span className="text-xs text-gray-500">
          {cards.length} / {maxSize}
        </span>
      </div>

      {/* 卡牌列表 */}
      <div className="flex gap-3 overflow-x-auto pb-4 px-2">
        <AnimatePresence>
          {displayCards.map((buff, index) => (
            <motion.div
              key={buff.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="flex-shrink-0"
            >
              <BuffCard
                buff={buff}
                onClick={() => onCardUse(buff.id)}
                disabled={disabled}
                size="medium"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 空位占位符 */}
        {Array.from({ length: Math.max(0, maxSize - displayCards.length) }).map(
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="flex-shrink-0 w-24 h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center"
            >
              <span className="text-gray-400 text-3xl">?</span>
            </div>
          )
        )}
      </div>

      {/* 提示文本 */}
      {cards.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          等待抽卡...
        </div>
      )}
    </div>
  )
}
