import { create } from 'zustand';
import {
  Word,
  LearningRecord,
  WordBook,
  UserSettings,
  UserProfile,
  MasteryLevel,
  StudyStats,
  StudySession,
  defaultShortcuts
} from '../types';
import {
  wordStorage,
  recordStorage,
  bookStorage,
  settingsStorage,
  profileStorage,
  statsStorage,
  sessionStorage,
  learningEventsStorage,
  triggerSync
} from '../storage';
import { calculateNextReview, calculateSM2, calculateAdaptiveNextReview } from '../utils/spaced-repetition';
import { initializeBuiltinData } from '../data/words';

interface AppState {
  // 状态
  words: Word[];
  records: Map<string, LearningRecord>;
  books: WordBook[];
  settings: UserSettings;
  profile: UserProfile | null;
  currentBook: WordBook | null;
  isLoading: boolean;
  todayStats: StudyStats;
  currentSession: StudySession | null;

  // 跨窗口同步 - 重新加载词库数据
  syncBooks: () => Promise<void>;

  // 初始化
  initialize: () => Promise<void>;

  // 单词操作
  loadWords: () => Promise<void>;
  addWord: (word: Word) => Promise<void>;
  getWordsByBook: (bookId: string) => Promise<Word[]>;

  // 学习记录操作
  loadRecords: () => Promise<void>;
  updateRecord: (wordId: string, correct: boolean, quality: number) => Promise<void>;
  getWordsToReview: () => Promise<Word[]>;
  getAllLearnedWords: () => Promise<Word[]>;
  getNewWords: (count: number) => Promise<Word[]>;

  // 词库操作
  loadBooks: () => Promise<void>;
  selectBook: (bookId: string) => Promise<void>;
  createBook: (book: Omit<WordBook, 'id'>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  addWordToBook: (bookId: string, wordId: string) => Promise<void>;
  removeWordFromBook: (bookId: string, wordId: string) => Promise<void>;
  batchAddWordsToBook: (bookId: string, words: Word[]) => Promise<void>;

  // 设置操作
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // 用户档案操作
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;

  // 统计操作
  loadTodayStats: () => Promise<void>;
  updateTodayStats: (updates: Partial<StudyStats>) => Promise<void>;
  updateStreak: () => Promise<void>;

  // 会话操作
  startSession: (mode: 'learn' | 'review' | 'quiz', bookId: string) => Promise<void>;
  endSession: () => Promise<void>;
  recordWordResult: (wordId: string, correct: boolean) => void;
}

const getDefaultSettings = (): UserSettings => ({
  dailyGoal: 20,
  pronunciation: 'us',
  autoPlay: true,
  darkMode: false,
  notifications: true,
  reminderTime: '09:00',
  studyMode: 'card_flip' as any,
  shortcuts: defaultShortcuts,
  quickReviewLimit: 30,
  enableAIAnalysis: true,
});

const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useAppStore = create<AppState>((set, get) => ({
  words: [],
  records: new Map(),
  books: [],
  settings: getDefaultSettings(),
  profile: null,
  currentBook: null,
  isLoading: true,
  todayStats: {
    date: getTodayDateString(),
    newWords: 0,
    reviewedWords: 0,
    studyTime: 0,
    correctRate: 0,
  },
  currentSession: null,

  initialize: async () => {
    set({ isLoading: true });

    // 记录开始时间
    const startTime = Date.now();

    // 首先初始化内置数据
    await initializeBuiltinData(wordStorage, bookStorage);
    // 然后加载所有数据
    await Promise.all([
      get().loadWords(),
      get().loadRecords(),
      get().loadBooks(),
      get().loadSettings(),
      get().loadProfile(),
      get().loadTodayStats(),
    ]);

    // 计算已消耗时间
    const elapsedTime = Date.now() - startTime;
    // 确保至少展示 2.5 秒的启动动画
    const minDisplayTime = 2500;
    
    if (elapsedTime < minDisplayTime) {
      await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsedTime));
    }

    set({ isLoading: false });
  },
  
  loadWords: async () => {
    const words = await wordStorage.getAll();
    set({ words });
  },
  
  addWord: async (word) => {
    await wordStorage.save(word);
    set((state) => ({ words: [...state.words, word] }));
  },
  
  getWordsByBook: async (bookId) => {
    const book = await bookStorage.getById(bookId);
    if (!book) return [];
    return wordStorage.getByIds(book.wordIds);
  },
  
  loadRecords: async () => {
    const recordList = await recordStorage.getAll();
    const records = new Map(recordList.map(r => [r.wordId, r]));
    set({ records });
  },
  
  updateRecord: async (wordId, correct, quality) => {
    const { records, words } = get();
    let record = records.get(wordId);
    const now = Date.now();
    const word = words.find(w => w.id === wordId);

    if (!record) {
      // 新词首次学习 - 使用默认的SM-2算法
      record = {
        wordId,
        masteryLevel: MasteryLevel.LEARNING,
        learnedAt: now,
        lastReviewAt: now,
        nextReviewAt: calculateNextReview(1),
        reviewCount: 1,
        correctCount: correct ? 1 : 0,
        wrongCount: correct ? 0 : 1,
        easeFactor: 2.5,
        interval: 1,
      };
    } else {
      // 复习更新 - 尝试使用AI自适应引擎
      try {
        // 获取该单词的学习历史
        const wordHistory = await learningEventsStorage.getWordHistory(wordId);

        // 使用AI自适应引擎预测下次复习时间
        const adaptivePlan = await calculateAdaptiveNextReview(wordId, wordHistory);

        // 更新掌握度
        const correctRate = (record.correctCount + (correct ? 1 : 0)) / (record.reviewCount + 1);

        record = {
          ...record,
          lastReviewAt: now,
          nextReviewAt: adaptivePlan.nextReviewAt,
          reviewCount: record.reviewCount + 1,
          correctCount: record.correctCount + (correct ? 1 : 0),
          wrongCount: record.wrongCount + (correct ? 0 : 1),
          interval: adaptivePlan.interval / 24, // 转换为天数（用于兼容）
          masteryLevel: correctRate >= 0.9 ? MasteryLevel.MASTERED :
                        correctRate >= 0.7 ? MasteryLevel.FAMILIAR :
                        correctRate >= 0.5 ? MasteryLevel.REVIEWING :
                        MasteryLevel.LEARNING,
        };

        console.log(`[AI] ${word?.word || wordId} 自适应复习计划:`, {
          interval: adaptivePlan.interval,
          confidence: adaptivePlan.confidence,
          reasoning: adaptivePlan.reasoning,
          difficulty: adaptivePlan.difficulty
        });
      } catch (error) {
        console.error('AI自适应预测失败，回退到SM-2:', error);

        // 回退到传统SM-2算法
        const sm2Result = calculateSM2(record.easeFactor, record.interval, quality);
        const correctRate = (record.correctCount + (correct ? 1 : 0)) / (record.reviewCount + 1);

        record = {
          ...record,
          lastReviewAt: now,
          nextReviewAt: calculateNextReview(sm2Result.interval),
          reviewCount: record.reviewCount + 1,
          correctCount: record.correctCount + (correct ? 1 : 0),
          wrongCount: record.wrongCount + (correct ? 0 : 1),
          easeFactor: sm2Result.easeFactor,
          interval: sm2Result.interval,
          masteryLevel: correctRate >= 0.9 ? MasteryLevel.MASTERED :
                        correctRate >= 0.7 ? MasteryLevel.FAMILIAR :
                        correctRate >= 0.5 ? MasteryLevel.REVIEWING :
                        MasteryLevel.LEARNING,
        };
      }
    }

    await recordStorage.save(record);
    set((state) => {
      const newRecords = new Map(state.records);
      newRecords.set(wordId, record!);
      return { records: newRecords };
    });
  },
  
  getWordsToReview: async () => {
    let { words, records } = get();

    // 如果 words 为空，尝试重新加载
    if (words.length === 0) {
      words = await wordStorage.getAll();
      set({ words });
    }

    const now = Date.now();
    const dueRecords = Array.from(records.values())
      .filter(r => r.nextReviewAt <= now)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);

    const dueWordIds = new Set(dueRecords.map(r => r.wordId));
    const reviewWords = words.filter(w => dueWordIds.has(w.id));

    // 如果发现有记录但找不到单词，清理孤立记录
    if (reviewWords.length < dueRecords.length) {
      const foundWordIds = new Set(reviewWords.map(w => w.id));
      const orphanRecords = dueRecords.filter(r => !foundWordIds.has(r.wordId));

      console.warn(`发现 ${orphanRecords.length} 条孤立的学习记录，正在清理...`);

      // 清理孤立记录
      for (const record of orphanRecords) {
        await recordStorage.delete(record.wordId);
        records.delete(record.wordId);
      }

      // 更新 records 状态
      set({ records });
    }

    return reviewWords;
  },

  getAllLearnedWords: async () => {
    let { words, records } = get();

    // 如果 words 为空，尝试重新加载
    if (words.length === 0) {
      words = await wordStorage.getAll();
      set({ words });
    }

    // 获取所有有学习记录的单词
    const learnedWordIds = new Set(records.keys());
    const learnedWords = words.filter(w => learnedWordIds.has(w.id));

    // 清理孤立记录
    if (learnedWords.length < learnedWordIds.size) {
      const foundWordIds = new Set(learnedWords.map(w => w.id));
      const orphanRecordIds = Array.from(learnedWordIds).filter(id => !foundWordIds.has(id));

      console.warn(`发现 ${orphanRecordIds.length} 条孤立的学习记录，正在清理...`);

      // 清理孤立记录
      for (const wordId of orphanRecordIds) {
        await recordStorage.delete(wordId);
        records.delete(wordId);
      }

      // 更新 records 状态
      set({ records });
    }

    return learnedWords;
  },

  getNewWords: async (count) => {
    const { words, records, currentBook } = get();
    if (!currentBook) return [];
    
    const bookWordIds = new Set(currentBook.wordIds);
    const learnedWordIds = new Set(records.keys());
    
    return words
      .filter(w => bookWordIds.has(w.id) && !learnedWordIds.has(w.id))
      .slice(0, count);
  },
  
  loadBooks: async () => {
    const books = await bookStorage.getAll();
    // 确保 wordCount 准确
    const updatedBooks = books.map(book => ({
      ...book,
      wordCount: book.wordIds.length
    }));
    set({ books: updatedBooks });
    // 默认选择第一个词库
    if (updatedBooks.length > 0 && !get().currentBook) {
      set({ currentBook: updatedBooks[0] });
    }
  },
  
  selectBook: async (bookId) => {
    const book = await bookStorage.getById(bookId);
    if (book) {
      set({ currentBook: book });
    }
  },
  
  createBook: async (bookData) => {
    const book: WordBook = {
      ...bookData,
      id: `book_${Date.now()}`,
    };
    await bookStorage.save(book);
    set((state) => ({ books: [...state.books, book] }));
  },

  deleteBook: async (bookId) => {
    await bookStorage.delete(bookId);
    set((state) => {
      const newBooks = state.books.filter(b => b.id !== bookId);
      let newCurrentBook = state.currentBook;
      if (state.currentBook?.id === bookId) {
        newCurrentBook = newBooks.length > 0 ? newBooks[0] : null;
      }
      return {
        books: newBooks,
        currentBook: newCurrentBook
      };
    });
  },
  
  addWordToBook: async (bookId, wordId) => {
    const book = await bookStorage.getById(bookId);
    if (book && !book.wordIds.includes(wordId)) {
      // 创建新数组而不是修改原数组，确保 React 能检测到变化
      const newWordIds = [...book.wordIds, wordId];
      const updatedBook = {
        ...book,
        wordIds: newWordIds,
        wordCount: newWordIds.length,
      };
      await bookStorage.save(updatedBook);
      set((state) => ({
        books: state.books.map(b => b.id === bookId ? updatedBook : b),
        currentBook: state.currentBook?.id === bookId ? updatedBook : state.currentBook,
      }));
      // 触发跨窗口同步
      triggerSync();
    }
  },

  removeWordFromBook: async (bookId, wordId) => {
    const book = await bookStorage.getById(bookId);
    if (book) {
      // 创建新数组而不是修改原数组，确保 React 能检测到变化
      const newWordIds = book.wordIds.filter(id => id !== wordId);
      const updatedBook = {
        ...book,
        wordIds: newWordIds,
        wordCount: newWordIds.length,
      };
      await bookStorage.save(updatedBook);
      set((state) => ({
        books: state.books.map(b => b.id === bookId ? updatedBook : b),
        currentBook: state.currentBook?.id === bookId ? updatedBook : state.currentBook,
      }));
      // 触发跨窗口同步
      triggerSync();
    }
  },
  
  batchAddWordsToBook: async (bookId, words) => {
    // 1. 获取现有单词以进行去重检查
    const existingWords = await wordStorage.getAll();
    const existingWordMap = new Map(existingWords.map(w => [w.word.toLowerCase(), w.id]));
    
    const finalWordsToAdd: Word[] = [];
    const wordIdsToAddToBook: string[] = [];

    for (const wordData of words) {
      const lowerWord = wordData.word.toLowerCase();
      if (existingWordMap.has(lowerWord)) {
        // 如果单词已存在，只记录其 ID 用于加入词库
        wordIdsToAddToBook.push(existingWordMap.get(lowerWord)!);
      } else {
        // 如果是全新单词，保存并记录 ID
        finalWordsToAdd.push(wordData);
        wordIdsToAddToBook.push(wordData.id);
      }
    }

    // 2. 保存真正的新单词到 wordStorage
    if (finalWordsToAdd.length > 0) {
      await wordStorage.saveMany(finalWordsToAdd);
    }
    
    // 3. 更新词库
    const book = await bookStorage.getById(bookId);
    if (book) {
      // 过滤掉词库中已经存在的单词 ID
      const uniqueNewWordIds = wordIdsToAddToBook.filter(id => !book.wordIds.includes(id));
      
      if (uniqueNewWordIds.length > 0) {
        book.wordIds.push(...uniqueNewWordIds);
        book.wordCount = book.wordIds.length;
        await bookStorage.save(book);
        
        set((state) => ({
          words: [...state.words, ...finalWordsToAdd],
          books: state.books.map(b => b.id === bookId ? book : b),
          currentBook: state.currentBook?.id === bookId ? book : state.currentBook,
        }));
      }
    }
  },
  
  loadSettings: async () => {
    const savedSettings = await settingsStorage.get();
    // 确保 shortcuts 字段存在，如果不存在则使用默认值
    const settings = {
      ...getDefaultSettings(),
      ...savedSettings,
      shortcuts: {
        ...defaultShortcuts,
        ...savedSettings?.shortcuts
      }
    };
    set({ settings });
  },
  
  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    await settingsStorage.save(newSettings);
    set({ settings: newSettings });
  },
  
  loadProfile: async () => {
    await profileStorage.checkStreak();
    const profile = await profileStorage.get();
    set({ profile });
  },
  
  updateProfile: async (updates) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      const newProfile = { ...currentProfile, ...updates };
      await profileStorage.save(newProfile);
      set({ profile: newProfile });
    }
  },
  
  createProfile: async (profileData) => {
    const profile: UserProfile = {
      ...profileData,
      id: `user_${Date.now()}`,
      createdAt: Date.now(),
    };
    await profileStorage.save(profile);
    set({ profile });
  },
  
  loadTodayStats: async () => {
    const today = getTodayDateString();
    const stats = await statsStorage.getByDate(today);
    set({
      todayStats: stats || {
        date: today,
        newWords: 0,
        reviewedWords: 0,
        studyTime: 0,
        correctRate: 0,
      },
    });
  },
  
  updateTodayStats: async (updates) => {
    const currentStats = get().todayStats;
    const newStats = { ...currentStats, ...updates };
    await statsStorage.save(newStats);
    set({ todayStats: newStats });
    
    // 只要有学习活动，就尝试更新连续学习天数
    if (newStats.newWords > 0 || newStats.reviewedWords > 0) {
      await get().updateStreak();
      // 更新后重新加载 profile 以反映最新的 streak
      const profile = await profileStorage.get();
      set({ profile });
    }
  },

  updateStreak: async () => {
    await profileStorage.updateStreak();
    const profile = await profileStorage.get();
    set({ profile });
  },
  
  startSession: async (mode, bookId) => {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      mode,
      wordBookId: bookId,
      startedAt: Date.now(),
      wordsStudied: [],
      correctWords: [],
      wrongWords: [],
    };
    await sessionStorage.saveCurrent(session);
    set({ currentSession: session });
  },
  
  endSession: async () => {
    const { currentSession } = get();
    if (currentSession) {
      currentSession.endedAt = Date.now();
      await sessionStorage.saveHistory(currentSession);
      await sessionStorage.clearCurrent();
      
      // 更新连续学习天数
      if (currentSession.wordsStudied.length > 0) {
        await get().updateStreak();
      }
      
      set({ currentSession: null });
    }
  },
  
  recordWordResult: (wordId, correct) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      const session = { ...state.currentSession };
      if (!session.wordsStudied.includes(wordId)) {
        session.wordsStudied.push(wordId);
      }
      if (correct && !session.correctWords.includes(wordId)) {
        session.correctWords.push(wordId);
      } else if (!correct && !session.wrongWords.includes(wordId)) {
        session.wrongWords.push(wordId);
      }
      
      return { currentSession: session };
    });
  },

  // 跨窗口同步：从存储重新加载词库数据
  syncBooks: async () => {
    const books = await bookStorage.getAll();
    const updatedBooks = books.map(book => ({
      ...book,
      wordCount: book.wordIds.length
    }));

    const currentBookId = get().currentBook?.id;
    const newCurrentBook = updatedBooks.find(b => b.id === currentBookId) || updatedBooks[0] || null;

    set({
      books: updatedBooks,
      currentBook: newCurrentBook
    });
  },
}));
