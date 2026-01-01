import { Word, WordBook } from '../types';
import { basicWordsData } from './basic-words-data';

// 预设词库配置（使用内置单词数据）
export const presetWordLists: Record<string, Word[]> = {
  // 基础词汇 - 50个常用单词
  basic: basicWordsData,
};

// 预设词库配置
export const builtinWordBooks: Omit<WordBook, 'wordIds'>[] = [
  {
    id: 'book_basic',
    name: '基础词汇',
    description: '适合入门学习的高频词汇',
    category: 'builtin',
    wordCount: basicWordsData.length,
    icon: '📚',
    color: '#3B82F6',
  },
];

// 初始化内置数据（直接加载内置单词）
export async function initializeBuiltinData(
  wordStorage: { save: (word: Word) => Promise<void>; getAll: () => Promise<Word[]>; delete?: (id: string) => Promise<void> },
  bookStorage: { save: (book: WordBook) => Promise<void>; getAll: () => Promise<WordBook[]>; delete: (id: string) => Promise<void> }
) {
  const existingWords = await wordStorage.getAll();
  const existingWordIds = new Set(existingWords.map(w => w.id));
  
  // 保存内置单词到存储（如果ID不存在则保存，如果存在则更新）
  let savedCount = 0;
  for (const wordData of basicWordsData) {
    await wordStorage.save(wordData); // 直接保存/更新，不检查是否存在
    if (!existingWordIds.has(wordData.id)) {
      savedCount++;
    }
  }
  
  if (savedCount > 0) {
    console.log(`新增了 ${savedCount} 个内置单词到存储`);
  }
  console.log(`内置单词总数: ${basicWordsData.length}`);
  
  // 清理不属于当前内置词库的旧单词（保留用户自定义单词）
  const validWordIds = new Set(basicWordsData.map(w => w.id));
  const obsoleteWords = existingWords.filter(w => 
    // 删除旧的内置单词（ID以word_开头但不在当前列表中）
    w.id.startsWith('word_') && !validWordIds.has(w.id)
  );
  
  if (wordStorage.delete) {
    for (const obsoleteWord of obsoleteWords) {
      await wordStorage.delete(obsoleteWord.id);
    }
    if (obsoleteWords.length > 0) {
      console.log(`已清理 ${obsoleteWords.length} 个旧内置单词`);
    }
  }
  
  // 获取所有现有词库，删除旧的内置词库（除了当前配置中的）
  const allBooks = await bookStorage.getAll();
  const validBookIds = new Set(builtinWordBooks.map(b => b.id));
  const obsoleteBuiltinBooks = allBooks.filter(b => b.category === 'builtin' && !validBookIds.has(b.id));
  
  for (const obsoleteBook of obsoleteBuiltinBooks) {
    await bookStorage.delete(obsoleteBook.id);
    console.log(`已删除旧词库: ${obsoleteBook.name}`);
  }
  
  // 创建或更新基础词库配置
  const basicBook = builtinWordBooks[0];
  
  // 获取所有基础单词的ID
  const wordIds = basicWordsData.map(w => w.id);
  
  const book: WordBook = {
    ...basicBook,
    wordIds: wordIds,
    wordCount: wordIds.length,
  };
  
  await bookStorage.save(book);
  console.log(`已初始化基础词库: ${book.name} (${book.wordCount}词)`);
}
