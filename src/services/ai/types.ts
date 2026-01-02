// AI 服务类型定义

export type AIProviderType = 'openai' | 'ollama' | 'anthropic' | 'gemini' | 'custom';

export interface AIProvider {
  type: AIProviderType;
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
}

export interface AIProviderConfig {
  name: string;
  baseUrl: string;
  defaultModel: string;
}

export interface AIConfig {
  enabled: boolean;
  provider: AIProviderType;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  providers: Record<AIProviderType, AIProviderConfig>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface WordExplanation {
  word: string;
  phonetic: {
    us: string;
    uk: string;
  };
  meanings: Array<{
    partOfSpeech: string;
    definition: string;
    translation: string;
  }>;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  rootAnalysis?: string;
  memoryTip?: string;
  relatedWords?: string[];
}

// AI 测验题目类型
export interface QuizQuestion {
  id: string;
  type: 'choice' | 'fill' | 'translation' | 'spelling';
  word: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIQuiz {
  questions: QuizQuestion[];
  totalScore: number;
  timeLimit: number; // 秒
}

// AI 学习建议类型
export interface StudySuggestion {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  focusWords: string[];
  dailyPlan: {
    newWords: number;
    reviewWords: number;
    practiceTime: number; // 分钟
  };
  encouragement: string;
}

// AI 例句生成结果
export interface GeneratedExample {
  sentence: string;
  translation: string;
  highlight: string; // 高亮单词在句中的形式
}

// AI 词义解释结果
export interface WordMeaningExplanation {
  word: string;
  basicMeaning: string;
  detailedExplanation: string;
  usageNotes: string;
  commonMistakes: string[];
  culturalNotes?: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

// 默认 AI 配置
export const defaultAIConfig: AIConfig = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: '',
  temperature: 0.7,
  maxTokens: 2000,
  providers: {
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o-mini',
    },
    ollama: {
      name: 'Ollama (本地)',
      baseUrl: 'http://localhost:11434',
      defaultModel: 'llama3',
    },
    anthropic: {
      name: 'Claude (Anthropic)',
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-3-5-sonnet-20240620',
    },
    gemini: {
      name: 'Gemini (Google)',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultModel: 'gemini-1.5-flash',
    },
    custom: {
      name: '自定义',
      baseUrl: '',
      defaultModel: '',
    },
  },
};
