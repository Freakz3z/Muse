/**
 * 智能单词选择器
 *
 * 基于遗忘曲线和薄弱词汇优先级选择单词
 *
 * 性能优化:
 * - 使用缓存避免重复计算
 * - 批量处理优先级计算
 */

import type { Word, LearningRecord } from '../types'

export interface WordPriority {
  word: Word
  score: number
  reason: string
}

export interface SelectionOptions {
  count: number // 需要选择的单词数量
  maxReviewRatio?: number // 复习词汇的最大比例 (0-1)，默认0.7
  includeNewWords?: boolean // 是否包含新词，默认true
}

// 缓存优先级计算结果
interface PriorityCache {
  data: Map<string, { score: number; reason: string }>
  timestamp: number
}

let priorityCache: PriorityCache | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存有效期

/**
 * 清理过期缓存
 */
function clearExpiredCache() {
  if (priorityCache && Date.now() - priorityCache.timestamp > CACHE_TTL) {
    priorityCache = null
  }
}

/**
 * 批量计算单词优先级（优化性能）
 */
function batchCalculatePriorities(
  words: Word[],
  records: Map<string, LearningRecord>,
  now: number
): Map<string, { score: number; reason: string }> {
  const results = new Map<string, { score: number; reason: string }>()

  // 预先计算常用值
  const keyIntervals = [
    20 * 60 * 1000, // 20分钟
    60 * 60 * 1000, // 1小时
    9 * 60 * 60 * 1000, // 9小时
    24 * 60 * 60 * 1000, // 1天
    2 * 24 * 60 * 60 * 1000, // 2天
    6 * 24 * 60 * 60 * 1000, // 6天
    31 * 24 * 60 * 60 * 1000, // 31天
  ]

  for (const word of words) {
    const record = records.get(word.id)
    const priority = calculateWordPriority(word, record, now, keyIntervals)
    results.set(word.id, { score: priority.score, reason: priority.reason })
  }

  return results
}

/**
 * 计算单词的优先级分数
 * 分数越高，优先级越高（越需要复习/学习）
 */
function calculateWordPriority(
  word: Word,
  record: LearningRecord | undefined,
  now: number,
  keyIntervals: number[] // 预计算的关键时间点
): WordPriority {
  // 如果没有记录，返回基础分数
  if (!record) {
    return {
      word,
      score: 50,
      reason: 'new',
    }
  }

  let score = 0
  const reasons: string[] = []

  // 因素1: 下次复习时间 (权重最高)
  if (record.nextReviewAt && record.nextReviewAt <= now) {
    const overdue = now - record.nextReviewAt
    const overdueHours = overdue / (1000 * 60 * 60)

    // 超期时间越长，优先级越高
    if (overdueHours > 48) {
      score += 100
      reasons.push('overdue-48h')
    } else if (overdueHours > 24) {
      score += 80
      reasons.push('overdue-24h')
    } else if (overdueHours > 12) {
      score += 60
      reasons.push('overdue-12h')
    } else {
      score += 40
      reasons.push('due')
    }
  } else if (record.nextReviewAt && record.nextReviewAt <= now + 24 * 60 * 60 * 1000) {
    // 24小时内即将复习
    score += 30
    reasons.push('soon')
  }

  // 因素2: 历史正确率
  const totalAttempts = record.correctCount + record.wrongCount
  if (totalAttempts > 0) {
    const accuracy = record.correctCount / totalAttempts

    if (accuracy < 0.4) {
      score += 50
      reasons.push('low-accuracy')
    } else if (accuracy < 0.6) {
      score += 30
      reasons.push('medium-accuracy')
    } else if (accuracy < 0.8) {
      score += 10
      reasons.push('high-accuracy')
    }
    // 正确率很高(>=0.8)不加分，说明掌握得不错
  }

  // 因素3: 错误次数比例
  // 如果错误次数显著多于正确次数，提高优先级
  if (totalAttempts >= 3 && record.wrongCount > record.correctCount) {
    score += 35
    reasons.push('more-errors')
  }

  // 因素4: 间隔重复阶段
  // interval是天数，转换为毫秒
  const intervalMs = record.interval * 24 * 60 * 60 * 1000
  if (intervalMs < 24 * 60 * 60 * 1000) {
    // < 1天
    score += 20
    reasons.push('stage-1d')
  } else if (intervalMs < 7 * 24 * 60 * 60 * 1000) {
    // < 7天
    score += 15
    reasons.push('stage-7d')
  } else if (intervalMs < 31 * 24 * 60 * 60 * 1000) {
    // < 31天
    score += 10
    reasons.push('stage-31d')
  }

  // 因素5: 掌握度
  // 掌握度低的优先级高
  if (record.masteryLevel <= 1) { // NEW or LEARNING
    score += 30
    reasons.push('learning')
  } else if (record.masteryLevel === 2) { // REVIEWING
    score += 15
    reasons.push('reviewing')
  }
  // FAMILIAR 和 MASTERED 不加分

  // 因素6: 艾宾浩斯遗忘曲线关键时间点
  // 20分钟、1小时、9小时、1天、2天、6天、31天
  const timeSinceLastReview = record.lastReviewAt ? now - record.lastReviewAt : Infinity

  for (let i = 0; i < keyIntervals.length; i++) {
    const interval = keyIntervals[i]
    // 如果在这个关键时间点前后10%范围内
    if (timeSinceLastReview >= interval * 0.9 && timeSinceLastReview <= interval * 1.1) {
      score += (keyIntervals.length - i) * 5 // 越早的关键点，分数越高
      reasons.push(`forgetting-curve-${i}`)
      break
    }
  }

  // 因素7: 总复习次数
  // 复习次数少且准确率低的，优先级高
  if (totalAttempts < 3 && totalAttempts > 0) {
    const accuracy = record.correctCount / totalAttempts
    if (accuracy < 0.7) {
      score += 15
      reasons.push('few-attempts-low-accuracy')
    }
  }

  // 因素8: 易度因子
  // 易度因子越低（接近1.3），说明记忆越困难
  if (record.easeFactor < 1.5) {
    score += 20
    reasons.push('hard')
  } else if (record.easeFactor < 2.0) {
    score += 10
    reasons.push('medium')
  }

  return {
    word,
    score,
    reason: reasons.join('+') || 'normal',
  }
}

/**
 * 智能选择测验单词（带缓存优化）
 */
export function selectQuizWords(
  allWords: Word[],
  records: Map<string, LearningRecord>,
  options: SelectionOptions
): Word[] {
  const {
    count,
    maxReviewRatio = 0.7,
    includeNewWords = true,
  } = options

  const now = Date.now()

  // 清理过期缓存
  clearExpiredCache()

  // 1. 计算所有单词的优先级
  const learnedWordIds = new Set(records.keys())
  const availableWords = allWords.filter(w => learnedWordIds.has(w.id))

  if (availableWords.length === 0) {
    // 如果没有学过的单词，返回随机新词
    return includeNewWords
      ? allWords.slice(0, Math.min(count, allWords.length))
      : []
  }

  // 批量计算优先级（使用缓存）
  let priorityMap: Map<string, { score: number; reason: string }>

  if (priorityCache) {
    // 使用缓存
    priorityMap = priorityCache.data
  } else {
    // 计算并缓存
    priorityMap = batchCalculatePriorities(availableWords, records, now)
    priorityCache = {
      data: priorityMap,
      timestamp: now,
    }
  }

  // 转换为数组并排序
  const priorities = availableWords.map(word => ({
    word,
    score: priorityMap.get(word.id)?.score || 0,
    reason: priorityMap.get(word.id)?.reason || 'normal',
  }))

  priorities.sort((a, b) => b.score - a.score)

  // 2. 按优先级排序
  priorities.sort((a, b) => b.score - a.score)

  // 3. 选择复习词汇（优先级高的）
  const reviewCount = Math.min(
    Math.floor(count * maxReviewRatio),
    priorities.length
  )

  const selectedWords: Word[] = []
  const usedIds = new Set<string>()

  // 添加高优先级的复习词
  for (let i = 0; i < reviewCount && i < priorities.length; i++) {
    const priority = priorities[i]
    if (!usedIds.has(priority.word.id)) {
      selectedWords.push(priority.word)
      usedIds.add(priority.word.id)
    }
  }

  // 4. 如果需要，补充新词
  if (includeNewWords && selectedWords.length < count) {
    const unlearned = allWords.filter(w => !learnedWordIds.has(w.id))
    const remainingCount = count - selectedWords.length

    // 随机选择新词
    const shuffled = unlearned.sort(() => Math.random() - 0.5)
    for (let i = 0; i < remainingCount && i < shuffled.length; i++) {
      if (!usedIds.has(shuffled[i].id)) {
        selectedWords.push(shuffled[i])
        usedIds.add(shuffled[i].id)
      }
    }
  }

  // 5. 如果还不够，从已学词中补充中等优先级的
  if (selectedWords.length < count) {
    for (let i = reviewCount; i < priorities.length && selectedWords.length < count; i++) {
      const priority = priorities[i]
      if (!usedIds.has(priority.word.id)) {
        selectedWords.push(priority.word)
        usedIds.add(priority.word.id)
      }
    }
  }

  // 6. 轻微打乱顺序，避免完全按优先级排列（增加趣味性）
  // 但保持高优先级的词更可能在前面
  const finalWords = selectedWords.sort(() => Math.random() - 0.5)

  return finalWords.slice(0, count)
}

/**
 * 清除缓存（强制重新计算）
 */
export function clearPriorityCache() {
  priorityCache = null
}

/**
 * 获取单词选择的原因说明（用于调试或显示给用户）
 */
export function getSelectionReasons(
  words: Word[],
  records: Map<string, LearningRecord>
): Map<string, string> {
  const now = Date.now()
  const reasons = new Map<string, string>()

  for (const word of words) {
    const record = records.get(word.id)
    const keyIntervals = [
      20 * 60 * 1000,
      60 * 60 * 1000,
      9 * 60 * 60 * 1000,
      24 * 60 * 60 * 1000,
      2 * 24 * 60 * 60 * 1000,
      6 * 24 * 60 * 60 * 1000,
      31 * 24 * 60 * 60 * 1000,
    ]
    const priority = calculateWordPriority(word, record, now, keyIntervals)
    reasons.set(word.id, priority.reason)
  }

  return reasons
}
