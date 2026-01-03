import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Loader2, 
  Plus, 
  Volume2, 
  Sparkles,
  Brain,
  BookOpen,
  Check,
  AlertCircle,
  History,
  X
} from 'lucide-react'
import { useAppStore } from '../store'
import { Word } from '../types'
import { aiService } from '../services/ai'
import { wordStorage } from '../storage'
import { WordMeaningExplanation, AIConfig, defaultAIConfig } from '../services/ai/types'

// 获取AI配置
const getAIConfig = (): AIConfig => {
  const savedConfig = localStorage.getItem('ai_config')
  return savedConfig ? JSON.parse(savedConfig) : defaultAIConfig
}

// 获取搜索历史
const getSearchHistory = (): string[] => {
  const history = localStorage.getItem('search_history')
  return history ? JSON.parse(history) : []
}

// 保存搜索历史
const saveSearchHistory = (word: string) => {
  const history = getSearchHistory()
  const newHistory = [word, ...history.filter(w => w !== word)].slice(0, 10)
  localStorage.setItem('search_history', JSON.stringify(newHistory))
}

export default function SearchPage() {
  const { books, addWord, addWordToBook, loadBooks } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchResult, setSearchResult] = useState<Word | null>(null)
  const [aiExplanation, setAiExplanation] = useState<WordMeaningExplanation | null>(null)
  const [displayedExplanation, setDisplayedExplanation] = useState<Partial<WordMeaningExplanation>>({})
  const [error, setError] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [addSuccess, setAddSuccess] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory())

  // 获取自定义词库
  const customBooks = books.filter(b => b.category === 'custom')

  // 流式显示AI解释
  const displayExplanationWithEffect = async (explanation: WordMeaningExplanation) => {
    setDisplayedExplanation({})
    
    // 基本含义
    if (explanation.basicMeaning) {
      const chars = explanation.basicMeaning.split('')
      for (let i = 0; i <= chars.length; i++) {
        setDisplayedExplanation(prev => ({
          ...prev,
          basicMeaning: chars.slice(0, i).join('')
        }))
        await new Promise(resolve => setTimeout(resolve, 30))
      }
    }

    // 详细解释
    if (explanation.detailedExplanation) {
      const chars = explanation.detailedExplanation.split('')
      for (let i = 0; i <= chars.length; i++) {
        setDisplayedExplanation(prev => ({
          ...prev,
          detailedExplanation: chars.slice(0, i).join('')
        }))
        await new Promise(resolve => setTimeout(resolve, 20))
      }
    }

    // 其他字段直接显示
    setDisplayedExplanation(explanation)
  }

  const handleSearch = async (word?: string) => {
    const queryWord = word || searchQuery.trim()
    if (!queryWord) return

    // 验证是否是有效的英文单词（只包含英文字母）
    const isValidWord = /^[a-zA-Z]+$/.test(queryWord)
    if (!isValidWord) {
      setError('请输入有效的英文单词（仅包含字母）')
      return
    }

    // 检查AI是否配置
    const aiConfig = getAIConfig()
    if (!aiConfig.enabled) {
      setError('请先在设置中配置 AI 服务')
      return
    }

    setSearchQuery(queryWord)
    setIsSearching(true)
    setError(null)
    setSearchResult(null)
    setAiExplanation(null)
    setAddSuccess(false)
    
    try {
      // 第一阶段：快速获取基本信息（词性、释义）
      const basicInfo = await aiService.enrichWordInfo(queryWord)
      
      if (basicInfo) {
        // 先显示基本信息
        const wordData: Word = {
          id: `word_${queryWord.toLowerCase()}_${Date.now()}`,
          word: queryWord,
          phonetic: basicInfo.phonetic,
          meanings: basicInfo.meanings.map(m => ({
            partOfSpeech: m.partOfSpeech,
            definition: '', // 第一阶段暂无英文定义
            translation: m.translation,
          })),
          examples: [], // 第一阶段暂无例句
          synonyms: [],
          antonyms: [],
          collocations: [],
          frequency: 'medium',
          tags: ['AI搜索'],
        }
        
        setSearchResult(wordData)
        setIsSearching(false)
        
        // 保存搜索历史
        saveSearchHistory(queryWord)
        setSearchHistory(getSearchHistory())
        
        // 第二阶段：异步获取详细信息（例句、同义词等）
        setIsAnalyzing(true)
        
        try {
          // 并行请求详细信息和深度分析
          const [detailedInfo, explanation] = await Promise.all([
            aiService.searchWord(queryWord),
            aiService.explainWordMeaning(queryWord)
          ])
          
          // 更新为完整信息
          if (detailedInfo) {
            const enrichedWordData: Word = {
              ...wordData,
              meanings: detailedInfo.meanings,
              examples: detailedInfo.examples || [],
              synonyms: detailedInfo.synonyms || [],
              antonyms: detailedInfo.antonyms || [],
              collocations: [],
              frequency: 'medium',
            }
            setSearchResult(enrichedWordData)
          }
          
          // 设置AI深度分析并显示打字机特效
          if (explanation) {
            setAiExplanation(explanation)
            await displayExplanationWithEffect(explanation)
          }
        } catch (detailError) {
          console.error('获取详细信息失败:', detailError)
          // 即使详细信息失败，也保留基本信息
        } finally {
          setIsAnalyzing(false)
        }
      } else {
        setError('AI搜索失败，请检查配置或稍后重试')
      }
    } catch (err) {
      console.error('搜索失败:', err)
      setError('搜索失败，请检查AI配置或稍后重试')
      setIsSearching(false)
    }
  }

  const handleAddToBook = async () => {
    if (!searchResult || !selectedBook) return

    try {
      // 先保存单词到存储
      await wordStorage.save(searchResult)
      await addWord(searchResult)

      // 添加到选中的词库
      await addWordToBook(selectedBook, searchResult.id)

      // 重新加载词库数据以更新单词数量
      await loadBooks()

      setAddSuccess(true)
      setTimeout(() => {
        setAddSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('添加单词失败:', err)
      setError('添加单词失败，请重试')
    }
  }

  const playAudio = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearHistory = () => {
    localStorage.removeItem('search_history')
    setSearchHistory([])
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="w-6 h-6 text-purple-500" />
          AI 单词搜索
        </h1>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          使用 AI 快速获取单词释义和深度分析
        </p>
      </div>

      {/* 搜索框 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入要搜索的英文单词..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-lg"
              autoFocus
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            搜索
          </button>
        </div>

        {/* 搜索历史 */}
        {searchHistory.length > 0 && !searchResult && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <History className="w-4 h-4" />
                搜索历史
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                清空
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(word)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl mb-6"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 搜索结果 */}
      {searchResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 单词基本信息 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{searchResult.word}</h2>
                  <div className="flex items-center gap-3">
                    {searchResult.phonetic.us && (
                      <span className="text-white/80">{searchResult.phonetic.us}</span>
                    )}
                    <button
                      onClick={() => playAudio(searchResult.word)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* 词义 */}
              <div className="space-y-4">
                {searchResult.meanings.map((meaning, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      {meaning.partOfSpeech}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-600">{meaning.definition}</p>
                      <p className="text-gray-800 font-medium mt-1">{meaning.translation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 例句 */}
              {searchResult.examples.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">例句</h3>
                  <div className="space-y-2">
                    {searchResult.examples.slice(0, 3).map((example, index) => (
                      <p key={index} className="text-gray-700 italic bg-gray-50 p-3 rounded-lg">
                        "{example}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI 分析 */}
          {getAIConfig().enabled && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">AI 深度分析</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              
              <div className="p-6">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-purple-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>AI 正在分析中...</span>
                  </div>
                ) : aiExplanation ? (
                  <div className="space-y-5">
                    {displayedExplanation.basicMeaning && (
                      <div>
                        <h4 className="text-sm font-medium text-purple-600 mb-2">基本含义</h4>
                        <p className="text-gray-700 bg-purple-50 p-4 rounded-xl">
                          {displayedExplanation.basicMeaning}
                          {displayedExplanation.basicMeaning !== aiExplanation.basicMeaning && (
                            <span className="inline-block w-2 h-4 bg-purple-600 ml-1 animate-pulse"></span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {displayedExplanation.detailedExplanation && (
                      <div>
                        <h4 className="text-sm font-medium text-purple-600 mb-2">详细解释</h4>
                        <p className="text-gray-600 leading-relaxed">
                          {displayedExplanation.detailedExplanation}
                          {displayedExplanation.detailedExplanation !== aiExplanation.detailedExplanation && (
                            <span className="inline-block w-2 h-4 bg-purple-600 ml-1 animate-pulse"></span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {displayedExplanation.usageNotes && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-600 mb-2">用法要点</h4>
                        <p className="text-gray-600 bg-blue-50 p-4 rounded-xl">{displayedExplanation.usageNotes}</p>
                      </div>
                    )}
                    
                    {displayedExplanation.commonMistakes && displayedExplanation.commonMistakes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-orange-600 mb-2">常见错误</h4>
                        <ul className="space-y-2">
                          {displayedExplanation.commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="text-gray-600 flex items-start gap-2">
                              <span className="text-orange-500 mt-1">•</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {displayedExplanation.culturalNotes && (
                      <div>
                        <h4 className="text-sm font-medium text-green-600 mb-2">文化背景</h4>
                        <p className="text-gray-600 bg-green-50 p-4 rounded-xl">{displayedExplanation.culturalNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">AI 分析未能获取，请检查 AI 配置</p>
                )}
              </div>
            </div>
          )}

          {/* 添加到词库 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-700 mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">添加到词库</span>
            </div>
            
            {customBooks.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {customBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => setSelectedBook(book.id === selectedBook ? '' : book.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        selectedBook === book.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selectedBook === book.id
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedBook === book.id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {book.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {book.wordIds.length} 个单词
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleAddToBook}
                  disabled={!selectedBook || addSuccess}
                  className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    addSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {addSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      已添加到词库
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      添加到选中词库
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm mb-1">暂无自定义词库</p>
                <p className="text-gray-400 text-xs">请先在词库管理中创建自定义词库</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 空状态 */}
      {!searchResult && !error && !isSearching && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">输入单词开始搜索</h3>
          <p className="text-gray-500">
            支持获取单词释义、例句、AI 智能分析
            <br />
            并可将单词添加到自定义词库
          </p>
        </div>
      )}
    </div>
  )
}
