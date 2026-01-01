import { Word } from '../types'

export interface ImportedWordEntry {
  word: string
  priority?: number
}

/**
 * 解析用户提供的 JSON 格式词库
 * 支持格式: {"word1": 1, "word2": 1, ...}
 */
export function parseJSONWordList(jsonString: string): ImportedWordEntry[] {
  try {
    const data = JSON.parse(jsonString)
    
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('JSON 格式错误，应为 {"word": priority, ...} 格式')
    }

    const entries: ImportedWordEntry[] = []
    
    for (const [word, priority] of Object.entries(data)) {
      if (typeof word === 'string' && word.trim()) {
        entries.push({
          word: word.trim().toLowerCase(),
          priority: typeof priority === 'number' ? priority : 1
        })
      }
    }

    return entries
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON 解析失败，请检查格式是否正确')
    }
    throw error
  }
}

/**
 * 将导入的单词转换为应用内的 Word 格式
 * 注意：由于没有完整信息，创建的是简化版 Word 对象
 */
export function convertToWord(entry: ImportedWordEntry): Word {
  return {
    id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    word: entry.word,
    phonetic: {
      us: '',
      uk: '',
    },
    meanings: [{
      partOfSpeech: 'unknown',
      definition: '',
      translation: '待补充',
    }],
    examples: [],
    synonyms: [],
    antonyms: [],
    collocations: [],
    tags: ['导入词汇'],
    frequency: 'medium',
  }
}

/**
 * 批量导入单词
 */
export async function importWords(
  jsonString: string,
  existingWords: Word[],
  addWordFn: (word: Word) => Promise<void>
): Promise<{ 
  imported: number
  skipped: number 
  errors: string[]
}> {
  const result = {
    imported: 0,
    skipped: 0,
    errors: [] as string[]
  }

  try {
    const entries = parseJSONWordList(jsonString)
    const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()))

    for (const entry of entries) {
      try {
        if (existingWordSet.has(entry.word)) {
          result.skipped++
          continue
        }

        const word = convertToWord(entry)
        await addWordFn(word)
        existingWordSet.add(entry.word)
        result.imported++
      } catch (error) {
        result.errors.push(`导入 "${entry.word}" 失败`)
      }
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : '导入过程发生未知错误')
  }

  return result
}

/**
 * 验证 JSON 格式是否正确
 */
export function validateJSONFormat(jsonString: string): { 
  valid: boolean
  wordCount: number
  error?: string 
} {
  try {
    const entries = parseJSONWordList(jsonString)
    return {
      valid: true,
      wordCount: entries.length
    }
  } catch (error) {
    return {
      valid: false,
      wordCount: 0,
      error: error instanceof Error ? error.message : '格式验证失败'
    }
  }
}
