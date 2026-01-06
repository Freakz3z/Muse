/**
 * 命运卡牌 Buff 数据
 * 包含所有可用的卡牌Buff定义
 */

import type { Buff, BuffType, BuffRarity } from '../types/card-game'

// ==================== Buff定义 ====================

export const BUFF_DEFINITIONS: Record<BuffType, Omit<Buff, 'id'>> = {
  // ==================== 正面Buff ====================

  [BuffType.DOUBLE_SCORE]: {
    type: BuffType.DOUBLE_SCORE,
    name: '双倍积分',
    description: '接下来3道题积分翻倍',
    rarity: 'rare',
    duration: 3,
    value: 2,
    icon: '💰',
    isPositive: true,
  },

  [BuffType.EXTRA_TIME]: {
    type: BuffType.EXTRA_TIME,
    name: '时间加成',
    description: '增加30秒游戏时间',
    rarity: 'common',
    value: 30,
    icon: '⏰',
    isPositive: true,
  },

  [BuffType.HINT]: {
    type: BuffType.HINT,
    name: '智慧之光',
    description: '显示当前题目的首个提示',
    rarity: 'common',
    icon: '💡',
    isPositive: true,
  },

  [BuffType.SHIELD]: {
    type: BuffType.SHIELD,
    name: '神圣护盾',
    description: '抵消一次错误回答',
    rarity: 'rare',
    icon: '🛡️',
    isPositive: true,
  },

  [BuffType.LUCKY_CARD]: {
    type: BuffType.LUCKY_CARD,
    name: '幸运卡',
    description: '跳过当前难题，不扣分',
    rarity: 'epic',
    icon: '🍀',
    isPositive: true,
  },

  [BuffType.COMBO_BOOST]: {
    type: BuffType.COMBO_BOOST,
    name: '连击加速',
    description: '接下来5题连击收益+50%',
    rarity: 'rare',
    duration: 5,
    value: 1.5,
    icon: '🔥',
    isPositive: true,
  },

  [BuffType.REVEAL_ANSWER]: {
    type: BuffType.REVEAL_ANSWER,
    name: '透视之眼',
    description: '揭示2个错误选项（选择题）',
    rarity: 'epic',
    icon: '👁️',
    isPositive: true,
  },

  // ==================== 负面Buff ====================

  [BuffType.TIME_ATTACK]: {
    type: BuffType.TIME_ATTACK,
    name: '时间紧迫',
    description: '当前题仅有30秒作答时间',
    rarity: 'common',
    duration: 1,
    value: 30,
    icon: '⚡',
    isPositive: false,
  },

  [BuffType.BLIND_MODE]: {
    type: BuffType.BLIND_MODE,
    name: '盲目模式',
    description: '隐藏50%的选项字母',
    rarity: 'rare',
    duration: 2,
    icon: '🙈',
    isPositive: false,
  },

  [BuffType.SHUFFLE]: {
    type: BuffType.SHUFFLE,
    name: '混乱诅咒',
    description: '选项位置每秒随机变换',
    rarity: 'epic',
    duration: 1,
    icon: '🌀',
    isPositive: false,
  },

  [BuffType.HARD_MODE]: {
    type: BuffType.HARD_MODE,
    name: '困难挑战',
    description: '接下来3题无任何提示',
    rarity: 'rare',
    duration: 3,
    icon: '💀',
    isPositive: false,
  },
}

// ==================== 稀有度配置 ====================

export const RARITY_CONFIG: Record<BuffRarity, {
  weight: number      // 权重（用于概率计算）
  color: string       // 显示颜色
  gradient: string    // 渐变色
}> = {
  common: {
    weight: 50,
    color: '#9ca3af',
    gradient: 'from-gray-400 to-gray-500',
  },
  rare: {
    weight: 30,
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
  },
  epic: {
    weight: 15,
    color: '#a855f7',
    gradient: 'from-purple-400 to-purple-600',
  },
  legendary: {
    weight: 5,
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
  },
}

// ==================== 工具函数 ====================

/**
 * 生成唯一Buff ID
 */
export function generateBuffId(): string {
  return `buff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 创建Buff实例
 */
export function createBuff(type: BuffType): Buff {
  const definition = BUFF_DEFINITIONS[type]
  return {
    id: generateBuffId(),
    ...definition,
  }
}

/**
 * 随机抽卡（基于稀有度权重）
 * @param excludeTypes - 排除的Buff类型（用于避免重复）
 * @param onlyPositive - 是否只抽正面Buff
 */
export function drawRandomCard(
  excludeTypes: BuffType[] = [],
  onlyPositive: boolean = false
): Buff {
  // 过滤可用的Buff类型
  let availableTypes = Object.keys(BUFF_DEFINITIONS) as BuffType[]

  if (excludeTypes.length > 0) {
    availableTypes = availableTypes.filter(t => !excludeTypes.includes(t))
  }

  if (onlyPositive) {
    availableTypes = availableTypes.filter(
      t => BUFF_DEFINITIONS[t].isPositive
    )
  }

  // 计算权重
  const weightedBuffs: Array<{ type: BuffType; weight: number }> = []
  for (const type of availableTypes) {
    const rarity = BUFF_DEFINITIONS[type].rarity
    const weight = RARITY_CONFIG[rarity].weight
    weightedBuffs.push({ type, weight })
  }

  // 加权随机选择
  const totalWeight = weightedBuffs.reduce((sum, b) => sum + b.weight, 0)
  let random = Math.random() * totalWeight

  for (const { type, weight } of weightedBuffs) {
    random -= weight
    if (random <= 0) {
      return createBuff(type)
    }
  }

  // 兜底：返回第一个可用的Buff
  return createBuff(availableTypes[0])
}

/**
 * 抽取多张卡牌
 */
export function drawMultipleCards(
  count: number,
  excludeTypes: BuffType[] = [],
  onlyPositive: boolean = false
): Buff[] {
  const cards: Buff[] = []
  const usedTypes: BuffType[] = [...excludeTypes]

  for (let i = 0; i < count; i++) {
    const card = drawRandomCard(usedTypes, onlyPositive)
    cards.push(card)
    usedTypes.push(card.type)
  }

  return cards
}

/**
 * 获取Buff显示信息
 */
export function getBuffDisplay(buff: Buff) {
  const rarity = RARITY_CONFIG[buff.rarity]
  return {
    ...buff,
    rarityColor: rarity.color,
    rarityGradient: rarity.gradient,
  }
}
