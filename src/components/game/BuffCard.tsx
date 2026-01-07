/**
 * Buff卡牌组件
 * 显示单张卡牌的视觉效果
 */

import { motion } from 'framer-motion'
import { getBuffDisplay } from '../../data/card-buffs'
import type { Buff } from '../../types/card-game'
import { Info } from 'lucide-react'

interface BuffCardProps {
  buff: Buff
  onClick?: () => void
  onInfoClick?: () => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  showRarity?: boolean
}

export default function BuffCard({
  buff,
  onClick,
  onInfoClick,
  disabled = false,
  size = 'medium',
  showRarity = true,
}: BuffCardProps) {
  const display = getBuffDisplay(buff)

  const sizeClasses = {
    small: 'w-16 h-24 text-xs',
    medium: 'w-24 h-36 text-sm',
    large: 'w-32 h-48 text-base',
  }

  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-5xl',
  }

  const handleCardClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onInfoClick) {
      onInfoClick()
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -5 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={handleCardClick}
        disabled={disabled}
        className={`
          relative overflow-hidden rounded-xl shadow-lg
          bg-gradient-to-br ${display.rarityGradient}
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-all duration-200
        `}
        style={{
          borderColor: display.rarityColor,
          borderWidth: '2px',
        }}
      >
      {/* 稀有度光晕 */}
      {showRarity && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${display.rarityColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 卡牌内容 */}
      <div className="relative h-full flex flex-col items-center justify-between p-3">
        {/* 图标 */}
        <div className={`${iconSizes[size]} flex-shrink-0`}>
          {display.icon}
        </div>

        {/* 名称 */}
        <div className="text-white font-bold text-center leading-tight line-clamp-2">
          {display.name}
        </div>

        {/* 稀有度标签 */}
        {showRarity && (
          <div className="text-white text-xs px-2 py-0.5 rounded-full bg-black/30">
            {display.rarity === 'common' && '普通'}
            {display.rarity === 'rare' && '稀有'}
            {display.rarity === 'epic' && '史诗'}
            {display.rarity === 'legendary' && '传说'}
          </div>
        )}
      </div>

      {/* 闪光效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />

      {/* 信息图标 - 点击查看详情 */}
      <button
        onClick={handleInfoClick}
        className="absolute top-1 right-1 p-1.5 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
        title="查看详情"
      >
        <Info className="w-3 h-3 text-white" />
      </button>
    </motion.button>
  </div>
  )
}
