/**
 * 卡牌游戏引擎
 * 负责游戏核心逻辑、状态管理和规则计算
 */

import type {
  CardGameState,
  CardQuestion,
  CardGameConfig,
  CardGameResult,
  Buff,
} from '../types/card-game'
import { BuffType, BuffRarity, QuestionType } from '../types/card-game'
import type { Word } from '../types'
import { drawMultipleCards } from '../data/card-buffs'

// ==================== 默认配置 ====================

export const DEFAULT_CONFIG: CardGameConfig = {
  maxQuestions: 10,
  handSize: 3,
  baseTime: 300, // 5分钟
  difficulty: 2,
  enableNegativeBuffs: true,
  cardDrawCooldown: 0,
}

// ==================== 游戏引擎类 ====================

export class CardGameEngine {
  private state: CardGameState
  private config: CardGameConfig
  private words: Word[]
  private onStateChange?: (state: CardGameState) => void

  constructor(words: Word[], config: Partial<CardGameConfig> = {}) {
    this.words = words
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = this.getInitialState()
  }

  /**
   * 获取初始游戏状态
   */
  private getInitialState(): CardGameState {
    // 初始抽卡
    const initialCards = drawMultipleCards(
      this.config.handSize,
      [],
      !this.config.enableNegativeBuffs
    )

    return {
      isPlaying: true,
      score: 0,
      combo: 0,
      maxCombo: 0,

      handSize: this.config.handSize,
      handCards: initialCards,
      discardPile: [],
      activeBuffs: [],

      currentQuestion: null,
      questionHistory: [],
      correctCount: 0,
      wrongCount: 0,

      timeRemaining: this.config.baseTime,
      totalTime: this.config.baseTime,

      maxQuestions: this.config.maxQuestions,
      currentQuestionIndex: 0,
    }
  }

  /**
   * 设置状态变化回调
   */
  onStateChanged(callback: (state: CardGameState) => void) {
    this.onStateChange = callback
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange() {
    this.onStateChange?.(this.state)
  }

  /**
   * 获取当前状态
   */
  getState(): CardGameState {
    return { ...this.state }
  }

  // ==================== 题目生成 ====================

  /**
   * 生成下一题
   */
  generateNextQuestion(): CardQuestion | null {
    if (this.state.currentQuestionIndex >= this.config.maxQuestions) {
      return null
    }

    // 随机选择一个单词
    const wordIndex = Math.floor(Math.random() * this.words.length)
    const word = this.words[wordIndex]

    // 随机选择题型
    const questionType = this.getRandomQuestionType()

    // 生成题目
    const question = this.createQuestion(word, questionType)

    this.state.currentQuestion = question
    this.state.currentQuestionIndex++
    this.notifyStateChange()

    return question
  }

  /**
   * 随机获取题型（基于权重）
   */
  private getRandomQuestionType(): QuestionType {
    const types: Array<{ type: QuestionType; weight: number }> = [
      { type: 'choice' as QuestionType, weight: 40 },      // 40%
      { type: 'spelling' as QuestionType, weight: 20 },    // 20%
      { type: 'translation' as QuestionType, weight: 15 }, // 15%
      { type: 'listening' as QuestionType, weight: 15 },   // 15%
      { type: 'fill_blank' as QuestionType, weight: 10 },  // 10%
    ]

    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0)
    let random = Math.random() * totalWeight

    for (const { type, weight } of types) {
      random -= weight
      if (random <= 0) {
        return type
      }
    }

    return 'choice' as QuestionType
  }

  /**
   * 创建题目
   */
  private createQuestion(word: Word, type: QuestionType): CardQuestion {
    const difficulty = this.calculateQuestionDifficulty()
    const basePoints = difficulty * 10

    const question: CardQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      word,
      type,
      difficulty,
      points: basePoints,
      data: {},
      appliedBuffs: [],
      timeLimit: undefined,
      showHint: false,
    }

    // 根据题型生成题目数据
    switch (type) {
      case 'choice':
        question.data = this.generateChoiceData(word)
        break
      case 'spelling':
        question.data = {
          hint: word.word[0],
        }
        break
      case 'translation':
        question.data = {
          sentence: word.examples[0] || `Use ${word.word} in a sentence.`,
          targetWord: word.word,
        }
        break
      case 'listening':
        question.data = {
          audioUrl: word.audioUrl?.us || '',
        }
        break
      case 'fill_blank':
        const example = word.examples[0] || ''
        const blanked = example.replace(
          new RegExp(word.word, 'gi'),
          '_____'
        )
        question.data = {
          blankSentence: blanked,
          options: this.generateFillBlankOptions(word),
        }
        break
    }

    // 应用活跃的Buff
    this.applyBuffsToQuestion(question)

    return question
  }

  /**
   * 生成选择题数据
   */
  private generateChoiceData(word: Word): CardQuestion['data'] {
    // 确保我们有有效的翻译
    let correctAnswer = word.meanings[0]?.translation

    // 如果没有翻译，使用word本身作为备选
    if (!correctAnswer || correctAnswer === '待补充' || correctAnswer === '待翻译') {
      correctAnswer = word.word
    }

    // 生成干扰项
    const wrongAnswers = this.generateWrongAnswers(word, 3)

    // 混合所有选项
    const choices = this.shuffleArray([correctAnswer, ...wrongAnswers])

    return {
      choices,
      correctAnswer,
    }
  }

  /**
   * 生成干扰项
   */
  private generateWrongAnswers(word: Word, count: number): string[] {
    const wrongAnswers: string[] = []
    const usedMeanings = new Set(word.meanings.map(m => m.translation))

    // 从其他单词中获取干扰项
    for (const w of this.words) {
      if (w.id === word.id) continue

      for (const meaning of w.meanings) {
        if (!usedMeanings.has(meaning.translation)) {
          wrongAnswers.push(meaning.translation)
          usedMeanings.add(meaning.translation)

          if (wrongAnswers.length >= count) {
            break
          }
        }
      }

      if (wrongAnswers.length >= count) break
    }

    // 如果干扰项不足，使用通用干扰词
    const fallbackWrong = [
      '错误选项A',
      '错误选项B',
      '错误选项C',
      '干扰选项',
    ]

    while (wrongAnswers.length < count) {
      wrongAnswers.push(fallbackWrong[wrongAnswers.length] || `错误${wrongAnswers.length + 1}`)
    }

    return wrongAnswers
  }

  /**
   * 生成填空题选项
   */
  private generateFillBlankOptions(word: Word): string[] {
    const options = [word.word]
    const usedWords = new Set([word.id])

    for (const w of this.words) {
      if (!usedWords.has(w.id) && w.word.length >= 3 && w.word.length <= 10) {
        options.push(w.word)
        usedWords.add(w.id)

        if (options.length >= 4) break
      }
    }

    return this.shuffleArray(options)
  }

  /**
   * 应用活跃Buff到题目
   */
  private applyBuffsToQuestion(question: CardQuestion): void {
    for (const activeBuff of this.state.activeBuffs) {
      const buff = activeBuff.buff

      // 记录应用的Buff
      question.appliedBuffs.push(buff.id)

      switch (buff.type) {
        case BuffType.TIME_ATTACK:
          question.timeLimit = buff.value || 30
          break

        case BuffType.REVEAL_ANSWER:
          if (question.type === 'choice' && question.data.choices && question.data.correctAnswer) {
            // 保留正确答案和1个干扰项
            const correct = question.data.correctAnswer
            const wrongAnswers = question.data.choices.filter(c => c !== correct)
            if (wrongAnswers.length > 0) {
              question.data.choices = [correct, wrongAnswers[0]]
            }
          }
          break

        case BuffType.SHIELD:
          // 护盾不影响题目生成，在答题时处理
          break
      }
    }
  }

  /**
   * 计算题目难度
   */
  private calculateQuestionDifficulty(): 1 | 2 | 3 | 4 | 5 {
    // 基于配置难度 + 随机波动
    const baseDifficulty = this.config.difficulty
    const variance = Math.random() > 0.5 ? 1 : -1
    const difficulty = Math.max(1, Math.min(5, baseDifficulty + variance))

    return difficulty as 1 | 2 | 3 | 4 | 5
  }

  // ==================== 答题处理 ====================

  /**
   * 处理答题
   */
  submitAnswer(answer: string): {
    isCorrect: boolean
    points: number
    message: string
  } {
    if (!this.state.currentQuestion) {
      throw new Error('No current question')
    }

    const question = this.state.currentQuestion
    const isCorrect = this.checkAnswer(question, answer)

    // 计算得分
    const points = isCorrect ? this.calculatePoints(question) : 0

    // 更新状态
    if (isCorrect) {
      this.state.correctCount++
      this.state.combo++
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo)
      this.state.score += points
    } else {
      // 检查护盾
      const hasShield = this.state.activeBuffs.some(
        ab => ab.buff.type === BuffType.SHIELD
      )

      if (hasShield) {
        // 消耗护盾
        this.state.activeBuffs = this.state.activeBuffs.filter(
          ab => ab.buff.type !== BuffType.SHIELD
        )
        // 不扣分，不中断连击
      } else {
        this.state.wrongCount++
        this.state.combo = 0
      }
    }

    // 记录历史
    this.state.questionHistory.push(question)

    // 减少Buff持续回合
    this.decreaseBuffDuration()

    this.notifyStateChange()

    return {
      isCorrect,
      points,
      message: isCorrect ? '正确！' : '错误！',
    }
  }

  /**
   * 检查答案
   */
  private checkAnswer(question: CardQuestion, answer: string): boolean {
    switch (question.type) {
      case 'choice':
      case 'fill_blank':
        return answer === question.data.correctAnswer

      case 'spelling':
      case 'translation':
        return answer.toLowerCase() === question.word.word.toLowerCase()

      case 'listening':
        return answer.toLowerCase() === question.word.word.toLowerCase()

      default:
        return false
    }
  }

  /**
   * 计算得分
   */
  private calculatePoints(question: CardQuestion): number {
    let points = question.points

    // 连击加成
    if (this.state.combo > 0) {
      const comboBonus = Math.min(this.state.combo * 0.1, 2.0) // 最多2倍加成
      points *= (1 + comboBonus)
    }

    // 应用Buff
    for (const activeBuff of this.state.activeBuffs) {
      const buff = activeBuff.buff

      if (buff.type === BuffType.DOUBLE_SCORE) {
        points *= buff.value || 2
      }

      if (buff.type === BuffType.COMBO_BOOST) {
        points *= buff.value || 1.5
      }
    }

    return Math.round(points)
  }

  /**
   * 减少Buff持续回合
   */
  private decreaseBuffDuration(): void {
    this.state.activeBuffs = this.state.activeBuffs
      .map(ab => ({
        ...ab,
        remainingTurns: ab.remainingTurns - 1,
      }))
      .filter(ab => ab.remainingTurns > 0)
  }

  // ==================== 卡牌操作 ====================

  /**
   * 使用手牌中的Buff
   */
  useCard(buffId: string): boolean {
    const cardIndex = this.state.handCards.findIndex(c => c.id === buffId)

    if (cardIndex === -1) {
      return false
    }

    const card = this.state.handCards[cardIndex]

    // 从手牌移除
    this.state.handCards.splice(cardIndex, 1)

    // 应用Buff效果
    this.applyBuffEffect(card)

    // 添加到弃牌堆
    this.state.discardPile.push(card)

    // 抽取新卡
    const newCard = drawMultipleCards(
      1,
      this.state.handCards.map(c => c.type),
      !this.config.enableNegativeBuffs
    )[0]

    this.state.handCards.push(newCard)

    this.notifyStateChange()

    return true
  }

  /**
   * 应用Buff效果
   */
  private applyBuffEffect(buff: Buff): void {
    switch (buff.type) {
      case BuffType.DOUBLE_SCORE:
      case BuffType.COMBO_BOOST:
      case BuffType.BLIND_MODE:
      case BuffType.HARD_MODE:
        // 持续性Buff，添加到活跃列表
        this.state.activeBuffs.push({
          buff,
          remainingTurns: buff.duration || 1,
          activatedAt: Date.now(),
        })
        break

      case BuffType.EXTRA_TIME:
        this.state.timeRemaining += buff.value || 30
        break

      case BuffType.HINT:
        if (this.state.currentQuestion) {
          this.state.currentQuestion.showHint = true
        }
        break

      case BuffType.SHIELD:
        this.state.activeBuffs.push({
          buff,
          remainingTurns: 999, // 护盾持续直到被使用
          activatedAt: Date.now(),
        })
        break

      case BuffType.LUCKY_CARD:
        // 跳过当前题
        this.state.currentQuestion = null
        break

      case BuffType.REVEAL_ANSWER:
      case BuffType.TIME_ATTACK:
        // 这些Buff在生成题目时应用
        if (this.state.currentQuestion) {
          this.applyBuffsToQuestion(this.state.currentQuestion)
        }
        break
    }
  }

  // ==================== 游戏控制 ====================

  /**
   * 更新计时器
   */
  tick(deltaSeconds: number): void {
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaSeconds)

    if (this.state.timeRemaining === 0) {
      this.endGame()
    }

    this.notifyStateChange()
  }

  /**
   * 检查游戏是否结束
   */
  isGameOver(): boolean {
    return (
      !this.state.isPlaying ||
      this.state.timeRemaining === 0 ||
      this.state.currentQuestionIndex >= this.config.maxQuestions
    )
  }

  /**
   * 结束游戏
   */
  endGame(): CardGameResult {
    this.state.isPlaying = false

    const result: CardGameResult = {
      score: this.state.score,
      combo: this.state.combo,
      maxCombo: this.state.maxCombo,
      correctCount: this.state.correctCount,
      wrongCount: this.state.wrongCount,
      accuracy:
        this.state.correctCount + this.state.wrongCount > 0
          ? Math.round(
              (this.state.correctCount /
                (this.state.correctCount + this.state.wrongCount)) *
                100
            )
          : 0,
      cardsUsed: this.state.discardPile.length,
      rareCardsPulled: this.state.discardPile.filter(
        c => c.rarity === BuffRarity.RARE || c.rarity === BuffRarity.EPIC || c.rarity === BuffRarity.LEGENDARY
      ).length,
      achievements: this.calculateAchievements(),
      playedAt: Date.now(),
    }

    this.notifyStateChange()

    return result
  }

  /**
   * 计算成就
   */
  private calculateAchievements(): string[] {
    const achievements: string[] = []

    if (this.state.maxCombo >= 5) {
      achievements.push('连击大师')
    }

    // 计算准确率
    const accuracy =
      this.state.correctCount + this.state.wrongCount > 0
        ? Math.round(
            (this.state.correctCount /
              (this.state.correctCount + this.state.wrongCount)) *
              100
          )
        : 0

    if (accuracy >= 90) {
      achievements.push('完美表现')
    }

    if (this.state.score >= 500) {
      achievements.push('高分选手')
    }

    // 计算稀有卡牌数量
    const rareCardsPulled = this.state.discardPile.filter(
      c => c.rarity === BuffRarity.RARE || c.rarity === BuffRarity.EPIC || c.rarity === BuffRarity.LEGENDARY
    ).length

    if (rareCardsPulled >= 3) {
      achievements.push('卡牌收藏家')
    }

    return achievements
  }

  // ==================== 工具函数 ====================

  /**
   * 数组随机打乱
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

/**
 * 创建游戏引擎实例
 */
export function createCardGameEngine(
  words: Word[],
  config?: Partial<CardGameConfig>
): CardGameEngine {
  return new CardGameEngine(words, config)
}
