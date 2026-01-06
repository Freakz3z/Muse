/**
 * 卡牌游戏类型定义
 * 命运卡牌模式 - 随机题型+随机Buff
 */

import type { Word } from './index'

// ==================== 题型类型 ====================

export enum QuestionType {
  CHOICE = 'choice',           // 四选一
  SPELLING = 'spelling',       // 拼写
  TRANSLATION = 'translation', // 翻译
  LISTENING = 'listening',     // 听力
  FILL_BLANK = 'fill_blank',   // 填空
  MATCHING = 'matching',       // 配对
}

// ==================== Buff类型 ====================

export enum BuffType {
  // 正面Buff
  DOUBLE_SCORE = 'double_score',         // 双倍积分
  EXTRA_TIME = 'extra_time',             // 额外时间
  HINT = 'hint',                         // 提示卡
  SHIELD = 'shield',                     // 护盾（抵消一次错误）
  LUCKY_CARD = 'lucky_card',             // 幸运卡（跳过难题）
  COMBO_BOOST = 'combo_boost',           // 连击加成
  REVEAL_ANSWER = 'reveal_answer',       // 揭示部分答案

  // 负面Buff (增加挑战性)
  TIME_ATTACK = 'time_attack',           // 时间紧迫（30秒限时）
  BLIND_MODE = 'blind_mode',             // 盲模式（隐藏部分选项）
  SHUFFLE = 'shuffle',                   // 选项混淆
  HARD_MODE = 'hard_mode',               // 困难模式（无提示）
}

export enum BuffRarity {
  COMMON = 'common',     // 普通（50%）
  RARE = 'rare',         // 稀有（30%）
  EPIC = 'epic',         // 史诗（15%）
  LEGENDARY = 'legendary', // 传说（5%）
}

// ==================== 数据结构 ====================

export interface Buff {
  id: string
  type: BuffType
  name: string
  description: string
  rarity: BuffRarity
  duration?: number  // 持续回合数，undefined表示一次性
  value?: number     // Buff数值（如双倍积分的倍数、额外时间秒数等）
  icon: string       // Emoji图标
  isPositive: boolean // true=正面Buff, false=负面Buff
}

export interface CardGameState {
  // 游戏基础信息
  isPlaying: boolean
  score: number
  combo: number
  maxCombo: number

  // 卡牌系统
  handSize: number        // 手牌数量（默认3张）
  handCards: Buff[]       // 当前手牌
  discardPile: Buff[]     // 弃牌堆
  activeBuffs: ActiveBuff[] // 当前激活的Buff

  // 题目系统
  currentQuestion: CardQuestion | null
  questionHistory: CardQuestion[]
  correctCount: number
  wrongCount: number

  // 时间系统
  timeRemaining: number
  totalTime: number

  // 游戏设置
  maxQuestions: number    // 总题数
  currentQuestionIndex: number
}

export interface ActiveBuff {
  buff: Buff
  remainingTurns: number // 剩余持续回合数
  activatedAt: number    // 激活时间戳
}

export interface CardQuestion {
  id: string
  word: Word
  type: QuestionType
  difficulty: 1 | 2 | 3 | 4 | 5
  points: number        // 本题基础分值

  // 题目数据
  data: {
    // 选择题
    choices?: string[]
    correctAnswer?: string

    // 拼写题
    hint?: string        // 首字母提示

    // 翻译题
    sentence?: string
    targetWord?: string

    // 听力题
    audioUrl?: string

    // 填空题
    blankSentence?: string
    options?: string[]

    // 配对题
    pairs?: Array<{ word: string; meaning: string }>
  }

  // Buff影响
  appliedBuffs: string[] // 应用于本题的Buff ID列表
  timeLimit?: number     // 本题限时（秒）
  showHint?: boolean     // 是否显示提示
}

export interface CardGameResult {
  score: number
  combo: number
  maxCombo: number
  correctCount: number
  wrongCount: number
  accuracy: number
  cardsUsed: number
  rareCardsPulled: number
  achievements: string[]
  playedAt: number
}

// ==================== 卡牌配置 ====================

export interface CardGameConfig {
  maxQuestions: number     // 最大题数（默认10）
  handSize: number         // 手牌数量（默认3）
  baseTime: number         // 基础时间（秒）
  difficulty: 1 | 2 | 3    // 难度等级
  enableNegativeBuffs: boolean // 是否启用负面Buff
  cardDrawCooldown: number // 抽卡冷却（回合数）
}
