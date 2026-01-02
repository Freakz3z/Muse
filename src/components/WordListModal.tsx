import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Volume2, 
  Search, 
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Word, WordBook } from '../types'
import { wordStorage } from '../storage'
import { useAppStore } from '../store'

interface WordListModalProps {
  isOpen: boolean
  onClose: () => void
  book: WordBook | null
}

export default function WordListModal({ isOpen, onClose, book: initialBook }: WordListModalProps) {
  const { books, removeWordFromBook } = useAppStore()
  const [words, setWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedWord, setExpandedWord] = useState<string | null>(null)

  // 从 store 中获取最新的 book 数据
  const book = books.find(b => b.id === initialBook?.id) || initialBook

  useEffect(() => {
    if (isOpen && book) {
      loadWordsForBook()
    }
  }, [isOpen, book?.id]) // 仅在 ID 变化或打开时重新加载

  const loadWordsForBook = async () => {
    if (!book) return
    
    setIsLoading(true)
    try {
      const wordList = await wordStorage.getByIds(book.wordIds)
      setWords(wordList)
    } catch (error) {
      console.error('加载单词失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  const handleRemoveWord = async (wordId: string) => {
    if (!book) return
    
    try {
      await removeWordFromBook(book.id, wordId)
      setWords(prev => prev.filter(w => w.id !== wordId))
    } catch (error) {
      console.error('移除单词失败:', error)
    }
  }

  const toggleExpand = (wordId: string) => {
    setExpandedWord(expandedWord === wordId ? null : wordId)
  }

  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.meanings.some(m => m.translation.includes(searchQuery))
  )

  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* 头部 */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: book.color || '#3b82f6' }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{book.name}</h2>
                <p className="text-sm text-gray-500">{words.length} 个单词</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词或释义..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 单词列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? '没有找到匹配的单词' : '词库中暂无单词'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredWords.map((word) => (
                <motion.div
                  key={word.id}
                  layout
                  className="bg-gray-50 rounded-xl overflow-hidden"
                >
                  {/* 单词主行 */}
                  <div 
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleExpand(word.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{word.word}</span>
                        {word.phonetic.us && (
                          <span className="text-gray-400 text-sm">{word.phonetic.us}</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm truncate mt-1">
                        {word.meanings[0]?.translation || word.meanings[0]?.definition || '暂无释义'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          playAudio(word.word)
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      
                      {book.category === 'custom' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveWord(word.id)
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                          title="从词库移除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {expandedWord === word.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* 展开详情 */}
                  <AnimatePresence>
                    {expandedWord === word.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                          {/* 所有释义 */}
                          {word.meanings.map((meaning, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium mt-0.5">
                                {meaning.partOfSpeech}
                              </span>
                              <div>
                                <p className="text-gray-600 text-sm">{meaning.definition}</p>
                                {meaning.translation && (
                                  <p className="text-gray-800 text-sm font-medium">{meaning.translation}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* 例句 */}
                          {word.examples.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-400 mb-2">例句</p>
                              {word.examples.slice(0, 3).map((example, index) => (
                                <p key={index} className="text-gray-600 text-sm italic mb-1">
                                  "{example}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-500">
          共 {filteredWords.length} 个单词
          {searchQuery && filteredWords.length !== words.length && (
            <span> (筛选自 {words.length} 个)</span>
          )}
        </div>
      </motion.div>
    </div>
  )
}
