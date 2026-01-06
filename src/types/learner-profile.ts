/**
 * AI原生学习引擎 - 用户画像类型定义
 *
 * 核心理念：每个学习者都是独特的
 * 我们通过6个维度来深度理解用户，实现真正的"因材施教"
 */

/**
 * 认知风格 - 用户如何最有效地接收信息
 */
export interface CognitiveStyle {
  /**
   * 视觉学习倾向 (0-1)
   * 越高越依赖图片、图表、视觉记忆
   */
  visualLearner: number;

  /**
   * 语言学习倾向 (0-1)
   * 越高越依赖文字解释、词义分析
   */
  verbalLearner: number;

  /**
   * 情境学习倾向 (0-1)
   * 越高越依赖上下文、场景例句
   */
  contextualLearner: number;

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * 记忆特征 - 用户如何遗忘和记忆
 */
export interface MemoryPattern {
  /**
   * 短期记忆强度 (0-1)
   * 首次学习后的保留率
   */
  shortTermRetention: number;

  /**
   * 长期记忆强度 (0-1)
   * 多次复习后的长期保留率
   */
  longTermRetention: number;

  /**
   * 个性化遗忘曲线
   * 数组代表不同时间点的保留率
   * 例如：[1.0, 0.8, 0.6, 0.4, 0.3]
   *      含义：即时、1天后、3天后、1周后、2周后
   */
  forgettingCurve: number[];

  /**
   * 最佳复习间隔 (小时)
   * AI根据个人数据预测的最优复习时间
   */
  optimalReviewInterval: number;

  /**
   * 记忆稳定性
   * 高值表示记忆持久，低值表示容易遗忘
   */
  memoryStability: number;

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * 学习行为模式 - 用户的学习习惯
 */
export interface BehaviorPattern {
  /**
   * 最佳学习时段
   * 'morning' | 'afternoon' | 'evening' | 'night'
   */
  preferredStudyTime: string;

  /**
   * 习惯学习时长 (分钟)
   */
  sessionDuration: number;

  /**
   * 错误模式
   * 'spelling' - 拼写错误
   * 'meaning' - 词义混淆
   * 'collocation' - 搭配错误
   * 'pronunciation' - 发音混淆
   */
  errorPatterns: string[];

  /**
   * 平均反应时间 (毫秒)
   * 认知负荷的间接指标
   */
  responseTime: number;

  /**
   * 学习一致性 (0-1)
   * 高值表示规律学习，低值表示断断续续
   */
  consistency: number;

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * 知识图谱节点
 */
export interface KnowledgeNode {
  word: string;
  masteryLevel: 'unknown' | 'learning' | 'familiar' | 'mastered';
  associations: string[]; // 关联词
  domains: string[]; // 所属领域
}

/**
 * 知识图谱 - 用户的词汇网络
 */
export interface KnowledgeGraph {
  /**
   * 词汇量估计
   */
  vocabularySize: number;

  /**
   * 已掌握的领域
   * 例如：['business', 'tech', 'daily', 'academic']
   */
  masteredDomains: string[];

  /**
   * 薄弱领域
   */
  weakDomains: string[];

  /**
   * 词义关联网络
   * key: 词ID, value: 相关词列表
   */
  wordAssociations: Map<string, string[]>;

  /**
   * 最近接触的词 (热点)
   */
  recentWords: string[];

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * 情感状态 - 用户当前的心理状态
 */
export interface EmotionalState {
  /**
   * 学习信心 (0-1)
   */
  confidence: number;

  /**
   * 当前动机 (0-1)
   */
  motivation: number;

  /**
   * 挫败感 (0-1)
   */
  frustration: number;

  /**
   * 心流状态 (0-1)
   * 高值表示处于最佳学习状态
   */
  flowScore: number;

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * 学习目标
 */
export interface LearningGoals {
  /**
   * 目标水平
   * 'cet4' | 'cet6' | 'ielts' | 'toefl' | 'business' | 'general'
   */
  targetLevel: string;

  /**
   * 距离目标的进度 (0-1)
   */
  progressToGoal: number;

  /**
   * 优先学习主题
   */
  priorityTopics: string[];

  /**
   * 目标词汇量
   */
  targetVocabularySize: number;

  /**
   * 时间压力 (天数)
   * -1 表示无时间限制
   */
  daysToDeadline: number;

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * AI Learner Profile - 完整用户画像
 *
 * 这是AI原生的核心：系统不只是记录数据，而是"理解"用户
 */
export interface AILearnerProfile {
  /**
   * 用户ID
   */
  userId: string;

  /**
   * 创建时间
   */
  createdAt: number;

  /**
   * 维度1: 认知风格
   */
  cognitiveStyle: CognitiveStyle;

  /**
   * 维度2: 记忆特征
   */
  memoryPattern: MemoryPattern;

  /**
   * 维度3: 学习行为
   */
  behaviorPattern: BehaviorPattern;

  /**
   * 维度4: 知识图谱
   */
  knowledgeGraph: KnowledgeGraph;

  /**
   * 维度5: 情感状态
   */
  emotionalState: EmotionalState;

  /**
   * 维度6: 学习目标
   */
  learningGoals: LearningGoals;

  /**
   * 画像版本
   * 用于追踪画像进化
   */
  version: number;

  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

/**
 * 学习事件 - 用于更新画像的数据点
 */
export interface LearningEvent {
  wordId: string;
  word: string;
  timestamp: number;
  action: 'learn' | 'review' | 'quiz';
  result: 'correct' | 'incorrect' | 'partial';
  confidence: number; // 用户自己的信心评分 (0-1)
  timeTaken: number; // 花费时间 (ms)
  context?: {
    sessionLength?: number;
    timeOfDay?: string;
    recentAccuracy?: number;
  };
}

/**
 * 画像更新结果
 */
export interface ProfileUpdateResult {
  success: boolean;
  updatedDimensions: string[];
  confidence: number; // 更新的置信度
  changes: {
    dimension: string;
    before: any;
    after: any;
  }[];
}

/**
 * 默认画像 - 用于初始化新用户
 */
export const createDefaultProfile = (userId: string): AILearnerProfile => ({
  userId,
  createdAt: Date.now(),
  cognitiveStyle: {
    visualLearner: 0.5,
    verbalLearner: 0.5,
    contextualLearner: 0.5,
    lastUpdated: Date.now(),
  },
  memoryPattern: {
    shortTermRetention: 0.7,
    longTermRetention: 0.5,
    forgettingCurve: [1.0, 0.7, 0.5, 0.35, 0.25],
    optimalReviewInterval: 24, // 默认1天
    memoryStability: 0.5,
    lastUpdated: Date.now(),
  },
  behaviorPattern: {
    preferredStudyTime: 'evening',
    sessionDuration: 30,
    errorPatterns: [],
    responseTime: 3000,
    consistency: 0.5,
    lastUpdated: Date.now(),
  },
  knowledgeGraph: {
    vocabularySize: 0,
    masteredDomains: [],
    weakDomains: [],
    wordAssociations: new Map(),
    recentWords: [],
    lastUpdated: Date.now(),
  },
  emotionalState: {
    confidence: 0.7,
    motivation: 0.8,
    frustration: 0.2,
    flowScore: 0.5,
    lastUpdated: Date.now(),
  },
  learningGoals: {
    targetLevel: 'general',
    progressToGoal: 0,
    priorityTopics: [],
    targetVocabularySize: 3000,
    daysToDeadline: -1,
    lastUpdated: Date.now(),
  },
  version: 1,
  lastUpdated: Date.now(),
});

/**
 * 画像质量分数
 * 用于判断画像是否足够成熟以启用AI功能
 */
export const getProfileQuality = (profile: AILearnerProfile): number => {
  const factors = [
    // 数据量（基于知识图谱）
    Math.min(profile.knowledgeGraph.vocabularySize / 100, 1),

    // 更新新鲜度（所有维度的平均更新时间）
    calculateFreshness(profile),

    // 完整性（非默认值的维度数）
    calculateCompleteness(profile),
  ];

  return factors.reduce((a, b) => a + b, 0) / factors.length;
};

const calculateFreshness = (profile: AILearnerProfile): number => {
  const now = Date.now();
  const daysSinceUpdate = (now - profile.lastUpdated) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - daysSinceUpdate / 30); // 30天后新鲜度降为0
};

const calculateCompleteness = (profile: AILearnerProfile): number => {
  // 简化版：检查是否有真实数据
  const hasData = {
    cognitive: profile.cognitiveStyle.visualLearner !== 0.5,
    memory: profile.memoryPattern.forgettingCurve.length > 0,
    behavior: profile.behaviorPattern.errorPatterns.length > 0,
    knowledge: profile.knowledgeGraph.vocabularySize > 0,
    goals: profile.learningGoals.targetLevel !== 'general',
  };

  return Object.values(hasData).filter(Boolean).length / Object.keys(hasData).length;
};
