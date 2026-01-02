import { AIProvider, ChatMessage, AIResponse, WordExplanation, AIConfig, defaultAIConfig, QuizQuestion, AIQuiz, StudySuggestion, GeneratedExample, WordMeaningExplanation, StudyPlan } from './types';
import { Word } from '../../types';

// 通用 AI 客户端基类
abstract class AIClient {
  protected provider: AIProvider;
  protected temperature: number;
  protected maxTokens: number;

  constructor(provider: AIProvider, temperature = 0.7, maxTokens = 2000) {
    this.provider = provider;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  abstract chat(messages: ChatMessage[]): Promise<AIResponse>;
}

// OpenAI 兼容客户端 (支持 OpenAI, DeepSeek, 智谱等兼容API)
class OpenAICompatibleClient extends AIClient {
  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API 错误: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }
}

// Ollama 客户端
class OllamaClient extends AIClient {
  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.provider.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages,
        stream: false,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API 错误: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      usage: data.eval_count ? {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count,
        totalTokens: (data.prompt_eval_count || 0) + data.eval_count,
      } : undefined,
    };
  }
}

// AI 服务主类
export class AIService {
  private client: AIClient | null = null;
  private provider: AIProvider | null = null;
  private config: AIConfig = defaultAIConfig;

  constructor() {
    // 尝试从 localStorage 加载配置
    this.loadConfig();
  }

  // 从 localStorage 加载配置
  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('ai_config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        if (this.config.enabled) {
          this.configureFromConfig(this.config);
        }
      }
    } catch (error) {
      console.error('加载 AI 配置失败:', error);
    }
  }

  // 根据 AIConfig 配置服务
  private configureFromConfig(config: AIConfig) {
    if (!config.enabled) {
      this.client = null;
      this.provider = null;
      return;
    }

    const providerConfig = config.providers[config.provider];
    const provider: AIProvider = {
      type: config.provider,
      name: providerConfig?.name || config.provider,
      baseUrl: config.baseUrl || providerConfig?.baseUrl || '',
      apiKey: config.apiKey,
      model: config.model || providerConfig?.defaultModel || '',
    };

    this.configure(provider, config.temperature, config.maxTokens);
  }

  // 更新配置（从设置页面调用）
  updateConfig(config: AIConfig) {
    this.config = config;
    if (config.enabled) {
      this.configureFromConfig(config);
    } else {
      this.client = null;
      this.provider = null;
    }
  }

  // 配置 AI 服务
  configure(provider: AIProvider, temperature = 0.7, maxTokens = 2000) {
    this.provider = provider;

    switch (provider.type) {
      case 'ollama':
        this.client = new OllamaClient(provider, temperature, maxTokens);
        break;
      case 'gemini':
        // TODO: 实现原生 Gemini 客户端，目前暂用 OpenAI 兼容模式（适用于 OneAPI 等中转）
        this.client = new OpenAICompatibleClient(provider, temperature, maxTokens);
        break;
      case 'anthropic':
        // TODO: 实现原生 Anthropic 客户端，目前暂用 OpenAI 兼容模式（适用于 OneAPI 等中转）
        this.client = new OpenAICompatibleClient(provider, temperature, maxTokens);
        break;
      case 'openai':
      case 'custom':
      default:
        this.client = new OpenAICompatibleClient(provider, temperature, maxTokens);
        break;
    }
  }

  // 检查服务是否可用
  isConfigured(): boolean {
    return this.client !== null && this.provider !== null && this.config.enabled;
  }

  // 通用聊天
  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    if (!this.client) {
      throw new Error('AI 服务未配置');
    }
    return this.client.chat(messages);
  }

  // 生成单词详细解释
  async generateWordExplanation(word: string, context?: string): Promise<WordExplanation> {
    const systemPrompt = `你是一个专业的英语教师和词汇学专家。请为用户提供详细、准确的单词解释。
你的回答必须是有效的JSON格式，包含以下字段：
{
  "word": "单词",
  "phonetic": { "us": "美式音标", "uk": "英式音标" },
  "meanings": [{ "partOfSpeech": "词性", "definition": "英文释义", "translation": "中文释义" }],
  "examples": ["例句1", "例句2", "例句3"],
  "synonyms": ["同义词"],
  "antonyms": ["反义词"],
  "collocations": ["常见搭配"],
  "rootAnalysis": "词根词缀分析",
  "memoryTip": "记忆技巧",
  "relatedWords": ["相关词汇"]
}
请确保音标使用标准IPA格式，例句要地道实用，中文翻译准确。`;

    const userPrompt = context 
      ? `请解释单词 "${word}"，上下文是："${context}"`
      : `请详细解释单词 "${word}"`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      // 尝试提取 JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法解析AI响应');
    } catch (error) {
      console.error('解析AI响应失败:', error);
      // 返回基础结构
      return {
        word,
        phonetic: { us: '', uk: '' },
        meanings: [{ partOfSpeech: '', definition: '', translation: response.content }],
        examples: [],
        synonyms: [],
        antonyms: [],
        collocations: [],
      };
    }
  }

  // 翻译文本
  async translate(text: string, to = 'zh'): Promise<string> {
    const systemPrompt = `你是一个专业的翻译助手。请将用户输入的文本翻译成${to === 'zh' ? '中文' : '英文'}。
如果输入是单个单词，请提供：单词、音标、词性和主要释义。
如果输入是句子或段落，请提供流畅自然的翻译。
只返回翻译结果，不要添加额外说明。`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ]);

    return response.content;
  }

  // 生成个性化例句
  async generateExamples(word: string, interest?: string, count = 3): Promise<string[]> {
    const interestContext = interest ? `请结合用户的兴趣爱好"${interest}"来造句。` : '';
    
    const response = await this.chat([
      { 
        role: 'system', 
        content: `你是一个英语教师。请为给定的单词造${count}个实用的例句。${interestContext}
例句要简洁易懂，适合记忆。只返回例句，每行一个，不要编号。` 
      },
      { role: 'user', content: word },
    ]);

    return response.content.split('\n').filter(line => line.trim());
  }

  // 生成记忆技巧
  async generateMemoryTip(word: string): Promise<string> {
    const response = await this.chat([
      { 
        role: 'system', 
        content: `你是一个记忆专家。请为给定的英语单词提供一个有趣、易记的记忆技巧。
可以使用谐音、联想、词根分析等方法。回答要简洁有趣，不超过100字。` 
      },
      { role: 'user', content: word },
    ]);

    return response.content;
  }

  // 生成带翻译的例句
  async generateExamplesWithTranslation(word: string, context?: string, count = 3): Promise<GeneratedExample[]> {
    const contextHint = context ? `请结合以下场景造句：${context}` : '';
    
    const response = await this.chat([
      { 
        role: 'system', 
        content: `你是一个专业的英语教师。请为给定的单词造${count}个实用的例句，并提供中文翻译。
${contextHint}
请以JSON数组格式返回，每个对象包含：
- sentence: 英文例句
- translation: 中文翻译
- highlight: 单词在句中的形式（可能有时态变化）

例句要求：
1. 难度适中，适合英语学习者
2. 语境自然，实用性强
3. 能够体现单词的典型用法

只返回JSON数组，不要其他内容。` 
      },
      { role: 'user', content: word },
    ]);

    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('解析例句响应失败:', error);
    }
    
    // 返回基础格式
    return response.content.split('\n').filter(line => line.trim()).slice(0, count).map(sentence => ({
      sentence,
      translation: '',
      highlight: word,
    }));
  }

  // AI 深度解释词义
  async explainWordMeaning(word: string, userLevel = 'intermediate'): Promise<WordMeaningExplanation> {
    const response = await this.chat([
      { 
        role: 'system', 
        content: `你是一个专业的英语词汇教师。请为学生深入解释单词的含义和用法。
学生水平：${userLevel === 'beginner' ? '初级' : userLevel === 'intermediate' ? '中级' : '高级'}

请严格按照以下JSON格式返回，不要添加任何额外的文字说明：
{
  "word": "单词",
  "basicMeaning": "基本含义（简洁的中文解释，20字以内）",
  "detailedExplanation": "详细解释（包括词源、引申义、语境用法等）",
  "usageNotes": "用法要点（什么场合用，搭配什么词等）",
  "commonMistakes": ["常见错误1", "常见错误2"],
  "culturalNotes": "文化背景（如有）",
  "difficultyLevel": "intermediate"
}

注意：只返回纯JSON对象，不要用markdown代码块包裹，不要添加其他说明。` 
      },
      { role: 'user', content: word },
    ]);

    try {
      // 清理响应内容
      let jsonStr = response.content.trim();
      
      // 移除markdown代码块标记
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // 提取JSON对象
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (error) {
      console.error('解析词义解释响应失败:', error);
      console.error('原始响应:', response.content);
    }
    
    // 返回默认值
    return {
      word,
      basicMeaning: response.content,
      detailedExplanation: '',
      usageNotes: '',
      commonMistakes: [],
      difficultyLevel: 'intermediate',
    };
  }

  // AI 生成测验题目
  async generateQuiz(words: string[], questionCount = 10, types: QuizQuestion['type'][] = ['choice', 'fill', 'translation']): Promise<AIQuiz> {
    const typeDescriptions: Record<QuizQuestion['type'], string> = {
      choice: '选择题：给出中文释义，选择正确的英文单词',
      fill: '填空题：给出例句（单词位置用___替代），填写正确单词',
      translation: '翻译题：给出英文句子，翻译成中文',
      spelling: '拼写题：给出中文释义和音标，拼写单词',
    };

    const selectedTypes = types.map(t => typeDescriptions[t]).join('\n');

    const response = await this.chat([
      { 
        role: 'system', 
        content: `你是一个英语测验出题专家。请根据给定的单词列表生成${questionCount}道测验题。

题目类型包括：
${selectedTypes}

请以JSON格式返回：
{
  "questions": [
    {
      "id": "q1",
      "type": "choice/fill/translation/spelling",
      "word": "考查的单词",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],  // 选择题需要
      "correctAnswer": "正确答案",
      "explanation": "解析",
      "difficulty": "easy/medium/hard"
    }
  ],
  "totalScore": 100,
  "timeLimit": 600
}

要求：
1. 题目难度要有梯度
2. 干扰选项要有迷惑性但不能太离谱
3. 解析要简洁明了
4. 尽量覆盖所有给定单词

只返回JSON，不要其他内容。` 
      },
      { role: 'user', content: `请为以下单词出题：${words.join(', ')}` },
    ]);

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('解析测验响应失败:', error);
    }
    
    return {
      questions: [],
      totalScore: 100,
      timeLimit: 600,
    };
  }

  // AI 生成学习建议
  async generateStudySuggestion(stats: {
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    reviewDueWords: number;
    averageAccuracy: number;
    studyDays: number;
    weakWords?: string[];
    wrongRecords?: { word: string; count: number }[];
  }): Promise<StudySuggestion> {
    const response = await this.chat([
      { 
        role: 'system', 
        content: `你是一个专业的英语学习顾问。请根据学生的学习数据，提供个性化的学习建议。
特别注意：如果提供了错题记录（wrongRecords），请分析这些单词的共同特征（如拼写、词性、含义混淆等），并给出针对性的记忆策略。

请以JSON格式返回：
{
  "summary": "整体学习情况总结（50字左右）",
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "recommendations": ["建议1", "建议2", "建议3"],
  "focusWords": ["需要重点关注的单词"],
  "dailyPlan": {
    "newWords": 建议每日新词数量,
    "reviewWords": 建议每日复习数量,
    "practiceTime": 建议每日学习时间（分钟）
  },
  "encouragement": "鼓励语（温暖有力，30字左右）"
}

只返回JSON，不要其他内容。` 
      },
      { role: 'user', content: `我的学习数据：
- 总单词数：${stats.totalWords}
- 已掌握：${stats.masteredWords}
- 学习中：${stats.learningWords}
- 待复习：${stats.reviewDueWords}
- 平均正确率：${(stats.averageAccuracy * 100).toFixed(1)}%
- 累计学习天数：${stats.studyDays}天
${stats.weakWords?.length ? `- 薄弱单词：${stats.weakWords.join(', ')}` : ''}
${stats.wrongRecords?.length ? `- 错题记录：${stats.wrongRecords.map(r => `${r.word}(错误${r.count}次)`).join(', ')}` : ''}` },
    ]);

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('解析学习建议响应失败:', error);
    }
    
    return {
      summary: '继续努力学习！',
      strengths: ['坚持学习'],
      weaknesses: ['需要更多练习'],
      recommendations: ['每天坚持学习', '及时复习'],
      focusWords: stats.weakWords || [],
      dailyPlan: {
        newWords: 20,
        reviewWords: 50,
        practiceTime: 30,
      },
      encouragement: '学习是一场马拉松，贵在坚持！加油！',
    };
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    try {
      await this.chat([
        { role: 'user', content: 'Hello' }
      ]);
      return true;
    } catch (error) {
      console.error('AI 连接测试失败:', error);
      return false;
    }
  }

  // 使用 AI 补充单词的音标、词性和翻译
  async enrichWordInfo(word: string): Promise<{
    phonetic: { us: string; uk: string };
    meanings: Array<{
      partOfSpeech: string;
      translation: string;
    }>;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await this.chat([
        {
          role: 'system',
          content: '你是一个专业的英语词典助手。请为用户提供准确的单词音标、词性和中文翻译。'
        },
        {
          role: 'user',
          content: `请为单词"${word}"提供以下信息，以JSON格式返回：
{
  "phonetic": {
    "us": "美式音标（使用IPA国际音标）",
    "uk": "英式音标（使用IPA国际音标）"
  },
  "meanings": [
    {
      "partOfSpeech": "词性（如n., v., adj.等）",
      "translation": "简洁的中文翻译"
    }
  ]
}

要求：
1. 音标使用标准IPA格式，包含斜杠 /ˈeksəmpl/
2. 提供1-3个最常用的词性和翻译
3. 翻译要简洁准确，用逗号分隔多个含义
4. 只返回JSON，不要其他解释`
        }
      ]);

      // 提取JSON内容
      let jsonStr = response.content.trim();
      // 尝试提取代码块中的JSON
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      
      const data = JSON.parse(jsonStr);
      return data;
    } catch (error) {
      console.error('AI 补充单词信息失败:', error);
      return null;
    }
  }

  // 使用 AI 完整搜索单词（快速版本）
  async searchWord(word: string): Promise<{
    word: string;
    phonetic: { us: string; uk: string };
    meanings: Array<{
      partOfSpeech: string;
      definition: string;
      translation: string;
    }>;
    examples: string[];
    synonyms?: string[];
    antonyms?: string[];
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await this.chat([
        {
          role: 'system',
          content: '你是一个专业的英语词典。请快速准确地提供单词信息。'
        },
        {
          role: 'user',
          content: `请为单词"${word}"提供完整的词典信息，以JSON格式返回：
{
  "word": "${word}",
  "phonetic": {
    "us": "美式音标",
    "uk": "英式音标"
  },
  "meanings": [
    {
      "partOfSpeech": "词性",
      "definition": "英文定义",
      "translation": "中文翻译"
    }
  ],
  "examples": ["实用例句1", "实用例句2", "实用例句3"],
  "synonyms": ["同义词1", "同义词2"],
  "antonyms": ["反义词1", "反义词2"]
}

要求：
1. 音标使用IPA格式
2. 提供2-4个主要词性和释义
3. 例句要实用且地道
4. 只返回JSON，不要其他内容`
        }
      ]);

      // 提取JSON内容
      let jsonStr = response.content.trim();
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }
      
      const data = JSON.parse(jsonStr);
      return data;
    } catch (error) {
      console.error('AI 搜索单词失败:', error);
      return null;
    }
  }

  // 根据主题或描述生成一批单词
  async generateWords(prompt: string, count: number): Promise<Partial<Word>[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const BATCH_SIZE = 10;
    const batches = Math.ceil(count / BATCH_SIZE);
    const allWords: Partial<Word>[] = [];

    for (let i = 0; i < batches; i++) {
      const currentBatchCount = Math.min(BATCH_SIZE, count - i * BATCH_SIZE);
      try {
        const response = await this.chat([
          {
            role: 'system',
            content: '你是一个专业的英语教学专家。请根据用户的要求生成一批相关的英语单词。'
          },
          {
            role: 'user',
            content: `请根据以下要求生成 ${currentBatchCount} 个英语单词：
要求：${prompt}
${i > 0 ? `注意：这是第 ${i + 1} 批单词，请不要与之前的单词重复。` : ''}

请以JSON数组格式返回，每个对象包含以下字段：
{
  "word": "单词",
  "phonetic": {
    "us": "美式音标",
    "uk": "英式音标"
  },
  "meanings": [
    {
      "partOfSpeech": "词性",
      "definition": "英文定义",
      "translation": "中文翻译"
    }
  ],
  "examples": ["例句1", "例句2"],
  "synonyms": ["同义词1"],
  "antonyms": ["反义词1"],
  "frequency": "high"
}

要求：
1. frequency 只能是 "high", "medium", "low" 之一。
2. 只返回JSON数组，不要其他解释。`
          }
        ]);

        let jsonStr = response.content.trim();
        const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1];
        }
        
        const data = JSON.parse(jsonStr);
        if (Array.isArray(data)) {
          allWords.push(...data);
        }
      } catch (error) {
        console.error(`AI 生成第 ${i + 1} 批单词失败:`, error);
        // 如果第一批就失败了，直接返回空；否则返回已经生成的
        if (i === 0) return [];
      }
    }

    return allWords;
  }

  // AI 生成智能学习计划
  async generateStudyPlan(params: {
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    studyGoal: string;
    availableTime: number;  // 每日可用时间（分钟）
    targetDate?: string;
    currentWordCount?: number;
    targetWordCount?: number;
    focusAreas?: string[];
  }): Promise<StudyPlan> {
    const response = await this.chat([
      {
        role: 'system',
        content: `你是一个专业的英语学习规划师。请根据用户的情况，制定一个科学、可行的英语单词学习计划。

请以JSON格式返回学习计划：
{
  "userLevel": "用户当前水平",
  "studyGoal": "学习目标简述",
  "availableTime": 每日可用时间（分钟）,
  "targetDate": "目标完成日期（如提供）",
  "planName": "计划名称",
  "totalWeeks": 计划总周数,
  "currentWeek": 1,
  "dailyPlan": {
    "newWords": 每日新词数量,
    "reviewWords": 每日复习数量,
    "studyTime": 建议学习时长（分钟）,
    "bestTime": "建议学习时段"
  },
  "weeklyGoals": [
    {
      "week": 周数,
      "targetWords": 累计目标词汇量,
      "description": "本周目标和重点"
    }
  ],
  "focusAreas": ["重点领域1", "重点领域2"],
  "suggestedBooks": ["推荐词库1", "推荐词库2"],
  "strategies": ["学习策略1", "学习策略2", "学习策略3"],
  "expectedOutcome": "预期达到的效果描述",
  "aiAdvice": "给用户的建议和鼓励"
}

要求：
1. 计划要切实可行，不要让用户感到压力过大
2. 考虑艾宾浩斯记忆曲线，合理安排新词学习和复习
3. 每周目标要有递进性
4. 策略要具体实用
5. 只返回JSON，不要其他内容`
      },
      {
        role: 'user',
        content: `请为我制定学习计划：
- 当前水平：${params.currentLevel}
- 学习目标：${params.studyGoal}
- 每日可用时间：${params.availableTime}分钟
${params.targetDate ? `- 目标完成日期：${params.targetDate}` : ''}
${params.currentWordCount ? `- 当前词汇量：约${params.currentWordCount}个` : ''}
${params.targetWordCount ? `- 目标词汇量：${params.targetWordCount}个` : ''}
${params.focusAreas?.length ? `- 重点领域：${params.focusAreas.join(', ')}` : ''}`
      }
    ]);

    try {
      let jsonStr = response.content.trim();
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      const planData = JSON.parse(jsonStr);
      return {
        id: `plan_${Date.now()}`,
        createdAt: Date.now(),
        status: 'active',
        ...planData,
      };
    } catch (error) {
      console.error('解析学习计划响应失败:', error);
      // 返回基础计划
      return {
        id: `plan_${Date.now()}`,
        createdAt: Date.now(),
        status: 'active',
        userLevel: params.currentLevel,
        studyGoal: params.studyGoal,
        availableTime: params.availableTime,
        targetDate: params.targetDate,
        planName: '个性化学习计划',
        totalWeeks: 8,
        currentWeek: 1,
        dailyPlan: {
          newWords: 20,
          reviewWords: 40,
          studyTime: params.availableTime,
          bestTime: '每天固定时段',
        },
        weeklyGoals: Array.from({ length: 8 }, (_, i) => ({
          week: i + 1,
          targetWords: (i + 1) * 150,
          description: `第${i + 1}周：继续稳步学习`,
        })),
        focusAreas: params.focusAreas || ['日常词汇'],
        suggestedBooks: ['基础词汇'],
        strategies: [
          '每天坚持学习新词',
          '及时复习旧词',
          '多读多写加深印象',
        ],
        expectedOutcome: '稳步提升词汇量',
        aiAdvice: response.content,
      };
    }
  }
}

// 单例
export const aiService = new AIService();
