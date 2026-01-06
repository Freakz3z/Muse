/**
 * AI Core Services
 *
 * Muse AI原生的核心服务层
 * 负责用户画像的创建、更新、管理和自适应学习
 */

export { ProfileManager, getProfileManager } from './profile-manager';
export { ProfileUpdater, getProfileUpdater } from './profile-updater';
export { AdaptiveLearningEngine, adaptiveEngine } from './adaptive-learning-engine';
export { PersonalizedContentGenerator, personalizedContentGenerator } from './personalized-content-generator';
export { LearningCoach, getLearningCoach } from './learning-coach';

// 重新导出核心类型
export type {
  AILearnerProfile,
  LearningEvent,
  ProfileUpdateResult,
  CognitiveStyle,
  MemoryPattern,
  BehaviorPattern,
  KnowledgeGraph,
  EmotionalState,
  LearningGoals,
} from '../../types/learner-profile';

// 重新导出自适应引擎类型
export type {
  AdaptiveReviewPlan,
  AdaptiveEngineConfig
} from './adaptive-learning-engine';

// 重新导出内容生成器类型
export type {
  ContentGenerationRequest,
  GeneratedExample,
  GeneratedMemoryTip,
  GeneratedExplanation,
  BatchContentRequest,
  ContentGeneratorConfig,
} from '../../types/personalized-content';

// 重新导出学习教练类型
export type {
  CoachIntervention,
  LearningSessionMetrics,
} from './learning-coach';
