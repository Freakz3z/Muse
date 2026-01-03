// 单词数据结构
export interface Word {
  id: string;
  word: string;
  phonetic: {
    us: string;  // 美式音标
    uk: string;  // 英式音标
  };
  meanings: Meaning[];
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];  // 常见搭配
  rootAnalysis?: string;   // 词根词缀解析
  frequency: 'high' | 'medium' | 'low';  // 使用频率
  tags: string[];
  audioUrl?: {
    us?: string;
    uk?: string;
  };
}

export interface Meaning {
  partOfSpeech: string;  // 词性
  definition: string;     // 英文释义
  translation: string;    // 中文释义
}

// 学习记录
export interface LearningRecord {
  wordId: string;
  masteryLevel: MasteryLevel;
  learnedAt: number;        // 首次学习时间
  lastReviewAt: number;     // 上次复习时间
  nextReviewAt: number;     // 下次复习时间
  reviewCount: number;      // 复习次数
  correctCount: number;     // 正确次数
  wrongCount: number;       // 错误次数
  easeFactor: number;       // SM-2算法的易度因子
  interval: number;         // 复习间隔（天）
}

export enum MasteryLevel {
  NEW = 0,        // 新词
  LEARNING = 1,   // 学习中
  REVIEWING = 2,  // 复习中
  FAMILIAR = 3,   // 熟悉
  MASTERED = 4,   // 已掌握
}

// 词库
export interface WordBook {
  id: string;
  name: string;
  description: string;
  category: 'builtin' | 'custom';
  wordCount: number;
  wordIds: string[];
  icon?: string;
  color?: string;
}

// 用户设置
export interface UserSettings {
  dailyGoal: number;           // 每日学习目标
  pronunciation: 'us' | 'uk';  // 发音偏好
  autoPlay: boolean;           // 自动播放发音
  darkMode: boolean;           // 深色模式
  notifications: boolean;      // 学习提醒
  reminderTime: string;        // 提醒时间
  studyMode: StudyMode;        // 学习模式
  shortcuts: ShortcutSettings; // 快捷键设置
  quickReviewLimit: number;    // 快速复习单词数量
  enableAIAnalysis: boolean;   // 启用AI自动分析
}

// 快捷键设置
export interface ShortcutSettings {
  // 学习/复习界面
  showAnswer: string;      // 显示答案
  prevWord: string;        // 上一个单词
  nextWord: string;        // 下一个单词
  markKnown: string;       // 标记认识
  markUnknown: string;     // 标记不认识
  playAudio: string;       // 播放发音
  // 复习界面额外快捷键
  rateEasy: string;        // 评分：简单
  rateGood: string;        // 评分：一般
  rateHard: string;        // 评分：困难
  rateAgain: string;       // 评分：重来
  // 全局快捷键
  toggleFloating: string;  // 切换悬浮窗
}

// 默认快捷键
export const defaultShortcuts: ShortcutSettings = {
  showAnswer: 'Space',
  prevWord: 'KeyQ',
  nextWord: 'KeyE',
  markKnown: 'KeyD',
  markUnknown: 'KeyA',
  playAudio: 'KeyR',
  rateEasy: 'Digit1',
  rateGood: 'Digit2',
  rateHard: 'Digit3',
  rateAgain: 'Digit4',
  toggleFloating: 'KeyF',
};

export enum StudyMode {
  CARD_FLIP = 'card_flip',     // 卡片翻转
  TYPING = 'typing',           // 拼写练习
  CHOICE = 'choice',           // 选择题
  LISTENING = 'listening',     // 听力练习
}

// 学习统计
export interface StudyStats {
  date: string;            // YYYY-MM-DD
  newWords: number;        // 新学单词数
  reviewedWords: number;   // 复习单词数
  studyTime: number;       // 学习时长（分钟）
  correctRate: number;     // 正确率
}

// 用户档案
export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  level: string;           // CEFR等级
  goal: 'exam' | 'daily' | 'professional';
  interests: string[];
  streak: number;          // 连续学习天数
  totalWords: number;      // 累计学习单词数
  createdAt: number;
  lastStudyAt: number;
}

// 测验结果
export interface QuizResult {
  id: string;
  type: QuizType;
  wordIds: string[];
  correctIds: string[];
  wrongIds: string[];
  score: number;
  duration: number;        // 用时（秒）
  completedAt: number;
}

export enum QuizType {
  CHOICE = 'choice',           // 四选一
  SPELLING = 'spelling',       // 拼写
  TRANSLATION = 'translation', // 翻译
  LISTENING = 'listening',     // 听力
  FILL_BLANK = 'fill_blank',   // 填空
}

// 成就系统
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: number;
}

// 学习会话
export interface StudySession {
  id: string;
  mode: 'learn' | 'review' | 'quiz';
  wordBookId: string;
  startedAt: number;
  endedAt?: number;
  wordsStudied: string[];
  correctWords: string[];
  wrongWords: string[];
}
