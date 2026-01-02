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
  sessionStorage
} from '../storage';
import { calculateNextReview, calculateSM2 } from '../utils/spaced-repetition';
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
  getNewWords: (count: number) => Promise<Word[]>;
  
  // 词库操作
  loadBooks: () => Promise<void>;
  selectBook: (bookId: string) => Promise<void>;
  createBook: (book: Omit<WordBook, 'id'>) => Promise<void>;
  addWordToBook: (bookId: string, wordId: string) => Promise<void>;
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
});

const getTodayDateString = () => new Date().toISOString().split('T')[0];

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
    const { records } = get();
    let record = records.get(wordId);
    const now = Date.now();
    
    if (!record) {
      // 新词首次学习
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
      // 复习更新
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
    
    await recordStorage.save(record);
    set((state) => {
      const newRecords = new Map(state.records);
      newRecords.set(wordId, record!);
      return { records: newRecords };
    });
  },
  
  getWordsToReview: async () => {
    const { words, records } = get();
    const now = Date.now();
    const dueRecords = Array.from(records.values())
      .filter(r => r.nextReviewAt <= now)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
    
    const dueWordIds = new Set(dueRecords.map(r => r.wordId));
    return words.filter(w => dueWordIds.has(w.id));
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
    set({ books });
    // 默认选择第一个词库
    if (books.length > 0 && !get().currentBook) {
      set({ currentBook: books[0] });
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
  
  addWordToBook: async (bookId, wordId) => {
    const book = await bookStorage.getById(bookId);
    if (book && !book.wordIds.includes(wordId)) {
      book.wordIds.push(wordId);
      book.wordCount = book.wordIds.length;
      await bookStorage.save(book);
      set((state) => ({
        books: state.books.map(b => b.id === bookId ? book : b),
        currentBook: state.currentBook?.id === bookId ? book : state.currentBook,
      }));
    }
  },
  
  batchAddWordsToBook: async (bookId, words) => {
    // 1. 保存所有单词到 wordStorage
    await wordStorage.saveMany(words);
    
    // 2. 更新词库
    const book = await bookStorage.getById(bookId);
    if (book) {
      const newWordIds = words.map(w => w.id);
      // 过滤掉已经存在的单词 ID
      const uniqueNewWordIds = newWordIds.filter(id => !book.wordIds.includes(id));
      
      if (uniqueNewWordIds.length > 0) {
        book.wordIds.push(...uniqueNewWordIds);
        book.wordCount = book.wordIds.length;
        await bookStorage.save(book);
        
        set((state) => ({
          words: [...state.words, ...words.filter(w => !state.words.some(sw => sw.id === w.id))],
          books: state.books.map(b => b.id === bookId ? book : b),
          currentBook: state.currentBook?.id === bookId ? book : state.currentBook,
        }));
      }
    }
  },
  
  loadSettings: async () => {
    const settings = await settingsStorage.get();
    set({ settings });
  },
  
  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    await settingsStorage.save(newSettings);
    set({ settings: newSettings });
  },
  
  loadProfile: async () => {
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
}));
