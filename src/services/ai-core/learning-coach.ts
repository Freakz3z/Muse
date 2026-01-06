/**
 * AI学习教练 - 主动提供学习建议和干预
 *
 * 功能:
 * 1. 疲劳检测 - 根据学习时长、错误率判断是否需要休息
 * 2. 困难模式识别 - 识别学习困难并调整策略
 * 3. 心流状态优化 - 保持用户在最佳学习状态
 * 4. 动机激励 - 提供鼓励和建议
 */

import type { AILearnerProfile } from '../../types/learner-profile'

export interface CoachIntervention {
  id: string
  type: 'rest' | 'difficulty' | 'motivation' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  actionable: boolean
  actionLabel?: string
  action?: () => void
  timestamp: number
}

export interface LearningSessionMetrics {
  sessionDuration: number // 毫秒
  wordsLearned: number
  correctCount: number
  incorrectCount: number
  averageResponseTime: number
  recentErrors: number // 最近10个词的错误数
  consecutiveCorrect: number
  consecutiveIncorrect: number
}

export class LearningCoach {
  private lastInterventionTime: number = 0
  private interventionCooldown: number = 5 * 60 * 1000 // 5分钟冷却

  /**
   * 分析学习会话并生成教练建议
   */
  analyzeSession(metrics: LearningSessionMetrics, profile: AILearnerProfile): CoachIntervention | null {
    const now = Date.now()

    // 检查冷却时间
    if (now - this.lastInterventionTime < this.interventionCooldown) {
      return null
    }

    // 优先级1: 检测疲劳
    const fatigueIntervention = this.checkFatigue(metrics, profile)
    if (fatigueIntervention) {
      this.lastInterventionTime = now
      return fatigueIntervention
    }

    // 优先级2: 检测困难模式
    const difficultyIntervention = this.checkDifficulty(metrics, profile)
    if (difficultyIntervention) {
      this.lastInterventionTime = now
      return difficultyIntervention
    }

    // 优先级3: 检测心流状态
    const flowIntervention = this.checkFlowState(metrics, profile)
    if (flowIntervention) {
      this.lastInterventionTime = now
      return flowIntervention
    }

    // 优先级4: 激励和建议
    const motivationIntervention = this.checkMotivation(metrics, profile)
    if (motivationIntervention) {
      this.lastInterventionTime = now
      return motivationIntervention
    }

    return null
  }

  /**
   * 检测疲劳 - 基于学习时长、错误率、反应时间
   */
  private checkFatigue(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const sessionMinutes = metrics.sessionDuration / (1000 * 60)
    const accuracy = metrics.correctCount / (metrics.correctCount + metrics.incorrectCount)
    const avgResponseTimeSeconds = metrics.averageResponseTime / 1000

    // 疲劳指标
    const isLongSession = sessionMinutes > 25 // 超过25分钟
    const isHighErrorRate = accuracy < 0.6 // 正确率低于60%
    const isSlowResponse = avgResponseTimeSeconds > 5 // 平均反应时间超过5秒
    const isConsecutiveErrors = metrics.consecutiveIncorrect >= 3 // 连续错误3次

    let fatigueScore = 0
    if (isLongSession) fatigueScore += 2
    if (isHighErrorRate) fatigueScore += 3
    if (isSlowResponse) fatigueScore += 2
    if (isConsecutiveErrors) fatigueScore += 3

    if (fatigueScore >= 5) {
      return {
        id: `fatigue-${Date.now()}`,
        type: 'rest',
        priority: 'high',
        title: '检测到学习疲劳',
        message: this.generateFatigueMessage(fatigueScore, sessionMinutes, accuracy),
        actionable: true,
        actionLabel: '休息一会',
        action: () => {
          // 建议休息15分钟
          console.log('建议休息15分钟')
        },
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 生成疲劳提示消息
   */
  private generateFatigueMessage(fatigueScore: number, sessionMinutes: number, accuracy: number): string {
    if (fatigueScore >= 8) {
      return `你已经学习了${Math.floor(sessionMinutes)}分钟，正确率降至${(accuracy * 100).toFixed(0)}%。强烈建议休息15-30分钟，让大脑充分恢复。`
    } else if (fatigueScore >= 6) {
      return `学习时长已超过${Math.floor(sessionMinutes)}分钟，检测到注意力下降。建议休息10分钟，喝杯水放松一下。`
    } else {
      return `连续学习${Math.floor(sessionMinutes)}分钟了，适当休息可以提高记忆效果哦！`
    }
  }

  /**
   * 检测困难模式 - 基于错误率、连续错误、特定词类型
   */
  private checkDifficulty(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const accuracy = metrics.correctCount / (metrics.correctCount + metrics.incorrectCount)

    // 困难指标
    const isLowAccuracy = accuracy < 0.5 // 整体正确率低于50%
    const isHighRecentErrors = metrics.recentErrors >= 5 // 最近10个词错5个以上
    const isConsecutiveErrors = metrics.consecutiveIncorrect >= 4 // 连续错误4次

    if (isLowAccuracy || isHighRecentErrors || isConsecutiveErrors) {
      return {
        id: `difficulty-${Date.now()}`,
        type: 'difficulty',
        priority: 'high',
        title: '遇到学习困难',
        message: this.generateDifficultyMessage(accuracy, metrics.consecutiveIncorrect),
        actionable: true,
        actionLabel: '降低难度',
        action: () => {
          console.log('建议降低难度或切换学习模式')
        },
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 生成困难模式提示消息
   */
  private generateDifficultyMessage(accuracy: number, consecutiveErrors: number): string {
    if (consecutiveErrors >= 4) {
      return `连续${consecutiveErrors}个单词没记住，这很正常！建议降低学习目标或休息一下，明天继续。`
    } else if (accuracy < 0.4) {
      return `当前正确率${(accuracy * 100).toFixed(0)}%，这些单词可能对你来说难度较高。建议先复习简单词汇建立信心。`
    } else {
      return `检测到学习困难，不要气馁！每个学习者都会遇到瓶颈。建议切换到复习模式巩固已学内容。`
    }
  }

  /**
   * 检测心流状态 - 优化学习体验
   */
  private checkFlowState(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const accuracy = metrics.correctCount / (metrics.correctCount + metrics.incorrectCount)
    const avgResponseTimeSeconds = metrics.averageResponseTime / 1000

    // 心流状态指标
    const isOptimalAccuracy = accuracy >= 0.7 && accuracy <= 0.9 // 70-90%正确率
    const isOptimalPace = avgResponseTimeSeconds >= 1.5 && avgResponseTimeSeconds <= 4 // 1.5-4秒反应时间
    const isLongStreak = metrics.consecutiveCorrect >= 10 // 连续正确10次

    if (isOptimalAccuracy && isOptimalPace) {
      return {
        id: `flow-${Date.now()}`,
        type: 'achievement',
        priority: 'low',
        title: '完美的心流状态！',
        message: `你的学习状态非常好！正确率${(accuracy * 100).toFixed(0)}%，节奏适中。保持这个状态，继续加油！`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    if (isLongStreak) {
      return {
        id: `streak-${Date.now()}`,
        type: 'achievement',
        priority: 'low',
        title: `连续答对${metrics.consecutiveCorrect}个！`,
        message: `太棒了！你已经连续答对${metrics.consecutiveCorrect}个单词，这说明你对这类词掌握得很好。可以尝试稍微增加难度。`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 检测动机激励 - 提供鼓励和建议
   */
  private checkMotivation(metrics: LearningSessionMetrics, _profile: AILearnerProfile): CoachIntervention | null {
    const sessionMinutes = metrics.sessionDuration / (1000 * 60)
    const wordsPerMinute = metrics.wordsLearned / (sessionMinutes || 1)

    // 达成里程碑
    if (metrics.wordsLearned === 10) {
      return {
        id: `milestone-10-${Date.now()}`,
        type: 'achievement',
        priority: 'medium',
        title: '已学习10个单词！',
        message: `很棒的开始！继续保持这个节奏。${this.getEncouragement()}`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    if (metrics.wordsLearned === 20) {
      return {
        id: `milestone-20-${Date.now()}`,
        type: 'achievement',
        priority: 'medium',
        title: '已学习20个单词！',
        message: `今天的学习效率很高！${this.getEncouragement()}`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    if (metrics.wordsLearned === 50) {
      return {
        id: `milestone-50-${Date.now()}`,
        type: 'achievement',
        priority: 'medium',
        title: '已学习50个单词！',
        message: `惊人的成就！今天已经学习了50个单词，大大超过了许多学习者的日常目标。`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    // 学习速度鼓励
    if (wordsPerMinute > 3 && sessionMinutes > 5) {
      return {
        id: `speed-${Date.now()}`,
        type: 'achievement',
        priority: 'low',
        title: '学习速度飞快！',
        message: `你的学习速度达到了每分钟${wordsPerMinute.toFixed(1)}个单词，远超平均水平。不过记得要保证质量哦！`,
        actionable: false,
        timestamp: Date.now(),
      }
    }

    return null
  }

  /**
   * 获取鼓励语句
   */
  private getEncouragement(): string {
    const encouragements = [
      '学习如逆水行舟，不进则退。加油！',
      '每一个单词的积累，都让你离目标更近一步。',
      '坚持就是胜利，你正在建立强大的词汇网络！',
      '相信过程，结果自然会来。',
      '你的努力终将得到回报，继续前进！',
    ]
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }
}

// 导出单例
let coachInstance: LearningCoach | null = null

export const getLearningCoach = (): LearningCoach => {
  if (!coachInstance) {
    coachInstance = new LearningCoach()
  }
  return coachInstance
}
