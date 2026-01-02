import { Word } from '../types'

export interface ImportedWordEntry {
  word: string
  priority?: number
}

/**
 * 解析用户提供的 JSON 格式词库
 * 支持格式: 
 * 1. {"bookName": "...", "words": [...]} (导出格式)
 * 2. [{"word": "...", ...}, ...] (Word 对象数组)
 * 3. {"word1": 1, "word2": 1, ...} (旧版格式)
 */
export function parseJSONWordList(jsonString: string): (Partial<Word> | ImportedWordEntry)[] {
  try {
    const data = JSON.parse(jsonString)
    
    // 1. 处理导出格式 {"bookName": "...", "words": [...]}
    if (data && typeof data === 'object' && Array.isArray(data.words)) {
      return data.words
    }

    // 2. 处理 Word 对象数组
    if (Array.isArray(data)) {
      return data.filter(item => item && typeof item.word === 'string')
    }

    // 3. 处理旧版格式 {"word": priority}
    if (typeof data === 'object' && data !== null) {
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
    }

    throw new Error('JSON 格式错误，应为单词对象数组或 {"word": priority} 格式')
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON 解析失败，请检查格式是否正确')
    }
    throw error
  }
}

/**
 * 将导入的单词转换为应用内的 Word 格式
 */
export function convertToWord(entry: Partial<Word> | ImportedWordEntry): Word {
  const id = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // 如果是完整的 Word 对象（或部分）
  if ('word' in entry && typeof entry.word === 'string' && !('priority' in entry)) {
    const wordEntry = entry as Partial<Word>
    return {
      id,
      word: wordEntry.word || '',
      phonetic: wordEntry.phonetic || { us: '', uk: '' },
      meanings: wordEntry.meanings || [{ partOfSpeech: 'unknown', definition: '', translation: '待补充' }],
      examples: wordEntry.examples || [],
      synonyms: wordEntry.synonyms || [],
      antonyms: wordEntry.antonyms || [],
      collocations: wordEntry.collocations || [],
      tags: wordEntry.tags || ['导入词汇'],
      frequency: wordEntry.frequency || 'medium',
      rootAnalysis: wordEntry.rootAnalysis,
      audioUrl: wordEntry.audioUrl,
    }
  }

  // 如果是旧版 ImportedWordEntry
  const simpleEntry = entry as ImportedWordEntry
  return {
    id,
    word: simpleEntry.word,
    phonetic: { us: '', uk: '' },
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
 * 导出词书为 JSON 文件
 */
export function exportBookAsJSON(bookName: string, words: Word[]) {
  const data = {
    bookName,
    exportDate: new Date().toISOString(),
    wordCount: words.length,
    words: words.map(({ id, ...rest }) => rest) // 导出时不包含 ID，导入时重新生成
  }
  
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  // 格式化日期作为文件名的一部分
  const date = new Date().toISOString().split('T')[0]
  link.href = url
  link.download = `${bookName}_${date}.json`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
