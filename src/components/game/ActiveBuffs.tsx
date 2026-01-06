/**
 * 活跃Buff显示组件
 * 显示当前激活的Buff效果
 */

import { motion, AnimatePresence } from 'framer-motion'
import type { ActiveBuff } from '../../types/card-game'
import { getBuffDisplay } from '../../data/card-buffs'

interface ActiveBuffsProps {
  buffs: ActiveBuff[]
}

export default function ActiveBuffs({ buffs }: ActiveBuffsProps) {
  if (buffs.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <AnimatePresence>
        {buffs.map((activeBuff) => {
          const display = getBuffDisplay(activeBuff.buff)

          return (
            <motion.div
              key={activeBuff.buff.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`
                flex-shrink-0 px-3 py-2 rounded-lg shadow-sm
                bg-gradient-to-r ${display.rarityGradient}
                border border-white/30
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{display.icon}</span>
                <div className="text-white">
                  <div className="text-xs font-bold">{display.name}</div>
                  {activeBuff.remainingTurns > 0 && (
                    <div className="text-xs opacity-80">
                      {activeBuff.remainingTurns} 回合
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
