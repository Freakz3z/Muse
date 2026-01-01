import localforage from 'localforage';
import { Word, LearningRecord, WordBook, UserSettings, StudyStats, UserProfile, QuizResult, StudySession, defaultShortcuts } from '../types';

// 初始化存储实例
const wordsStore = localforage.createInstance({ name: 'muse', storeName: 'words' });
const recordsStore = localforage.createInstance({ name: 'muse', storeName: 'records' });
const booksStore = localforage.createInstance({ name: 'muse', storeName: 'books' });
const settingsStore = localforage.createInstance({ name: 'muse', storeName: 'settings' });
const statsStore = localforage.createInstance({ name: 'muse', storeName: 'stats' });
const profileStore = localforage.createInstance({ name: 'muse', storeName: 'profile' });
const quizStore = localforage.createInstance({ name: 'muse', storeName: 'quiz' });
const sessionStore = localforage.createInstance({ name: 'muse', storeName: 'session' });

// 单词操作
export const wordStorage = {
  async getAll(): Promise<Word[]> {
    const words: Word[] = [];
    await wordsStore.iterate<Word, void>((value) => {
      words.push(value);
    });
    return words;
  },

  async getById(id: string): Promise<Word | null> {
    return await wordsStore.getItem(id);
  },

  async getByIds(ids: string[]): Promise<Word[]> {
    const words: Word[] = [];
    for (const id of ids) {
      const word = await wordsStore.getItem<Word>(id);
      if (word) words.push(word);
    }
    return words;
  },

  async save(word: Word): Promise<void> {
    await wordsStore.setItem(word.id, word);
  },

  async saveMany(words: Word[]): Promise<void> {
    for (const word of words) {
      await wordsStore.setItem(word.id, word);
    }
  },

  async delete(id: string): Promise<void> {
    await wordsStore.removeItem(id);
  },

  async clear(): Promise<void> {
    await wordsStore.clear();
  },
};

// 学习记录操作
export const recordStorage = {
  async getAll(): Promise<LearningRecord[]> {
    const records: LearningRecord[] = [];
    await recordsStore.iterate<LearningRecord, void>((value) => {
      records.push(value);
    });
    return records;
  },

  async getByWordId(wordId: string): Promise<LearningRecord | null> {
    return await recordsStore.getItem(wordId);
  },

  async save(record: LearningRecord): Promise<void> {
    await recordsStore.setItem(record.wordId, record);
  },

  async delete(wordId: string): Promise<void> {
    await recordsStore.removeItem(wordId);
  },

  async getDueForReview(now: number = Date.now()): Promise<LearningRecord[]> {
    const records: LearningRecord[] = [];
    await recordsStore.iterate<LearningRecord, void>((value) => {
      if (value.nextReviewAt <= now) {
        records.push(value);
      }
    });
    return records.sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  },
};

// 词库操作
export const bookStorage = {
  async getAll(): Promise<WordBook[]> {
    const books: WordBook[] = [];
    await booksStore.iterate<WordBook, void>((value) => {
      books.push(value);
    });
    return books;
  },

  async getById(id: string): Promise<WordBook | null> {
    return await booksStore.getItem(id);
  },

  async save(book: WordBook): Promise<void> {
    await booksStore.setItem(book.id, book);
  },

  async delete(id: string): Promise<void> {
    await booksStore.removeItem(id);
  },
};

// 用户设置操作
export const settingsStorage = {
  async get(): Promise<UserSettings> {
    const settings = await settingsStore.getItem<UserSettings>('settings');
    return settings || {
      dailyGoal: 20,
      pronunciation: 'us',
      autoPlay: true,
      darkMode: false,
      notifications: true,
      reminderTime: '09:00',
      studyMode: 'card_flip' as any,
      shortcuts: defaultShortcuts,
    };
  },

  async save(settings: UserSettings): Promise<void> {
    await settingsStore.setItem('settings', settings);
  },
};

// 学习统计操作
export const statsStorage = {
  async getByDate(date: string): Promise<StudyStats | null> {
    return await statsStore.getItem(date);
  },

  async getRange(startDate: string, endDate: string): Promise<StudyStats[]> {
    const stats: StudyStats[] = [];
    await statsStore.iterate<StudyStats, void>((value) => {
      if (value.date >= startDate && value.date <= endDate) {
        stats.push(value);
      }
    });
    return stats.sort((a, b) => a.date.localeCompare(b.date));
  },

  async save(stats: StudyStats): Promise<void> {
    await statsStore.setItem(stats.date, stats);
  },

  async getLast30Days(): Promise<StudyStats[]> {
    const stats: StudyStats[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStat = await statsStore.getItem<StudyStats>(dateStr);
      stats.push(dayStat || {
        date: dateStr,
        newWords: 0,
        reviewedWords: 0,
        studyTime: 0,
        correctRate: 0,
      });
    }
    return stats;
  },
};

// 用户档案操作
export const profileStorage = {
  async get(): Promise<UserProfile | null> {
    return await profileStore.getItem('profile');
  },

  async save(profile: UserProfile): Promise<void> {
    await profileStore.setItem('profile', profile);
  },

  async updateStreak(): Promise<void> {
    const profile = await this.get();
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastStudy = new Date(profile.lastStudyAt).toISOString().split('T')[0];
    
    const todayDate = new Date(today);
    const lastDate = new Date(lastStudy);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      profile.streak += 1;
    } else if (diffDays > 1) {
      profile.streak = 1;
    }
    
    profile.lastStudyAt = Date.now();
    await this.save(profile);
  },
};

// 测验结果操作
export const quizStorage = {
  async getAll(): Promise<QuizResult[]> {
    const results: QuizResult[] = [];
    await quizStore.iterate<QuizResult, void>((value) => {
      results.push(value);
    });
    return results.sort((a, b) => b.completedAt - a.completedAt);
  },

  async save(result: QuizResult): Promise<void> {
    await quizStore.setItem(result.id, result);
  },

  async getRecent(limit: number = 10): Promise<QuizResult[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  },
};

// 学习会话操作
export const sessionStorage = {
  async getCurrent(): Promise<StudySession | null> {
    return await sessionStore.getItem('current');
  },

  async saveCurrent(session: StudySession): Promise<void> {
    await sessionStore.setItem('current', session);
  },

  async clearCurrent(): Promise<void> {
    await sessionStore.removeItem('current');
  },

  async saveHistory(session: StudySession): Promise<void> {
    await sessionStore.setItem(session.id, session);
  },
};
