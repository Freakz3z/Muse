import { useState, useEffect } from 'react'
import { Search, X, Plus, Volume2, Check, AlertCircle, Settings, BookDown } from 'lucide-react'
import { useAppStore } from '../store'
import { dictionaryService } from '../services/dictionary'
import { voiceService } from '../services/voice'
import { aiService } from '../services/ai'
import './FloatingWindow.css'

export default function FloatingWindow() {
  const { settings, books, currentBook, addWordToBook, addWord, selectBook } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showWordInfo, setShowWordInfo] = useState(false)
  const [addedToBook, setAddedToBook] = useState(false)
  const [isAIConfigured, setIsAIConfigured] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>(currentBook?.id)
  const [showBookSelector, setShowBookSelector] = useState(false)

  // 只显示自定义词库（过滤掉内置词库）
  const customBooks = books.filter(book => book.category !== 'builtin')

  // 检查 AI 是否配置
  useEffect(() => {
    const checkAIConfig = () => {
      const configured = aiService.isConfigured()
      setIsAIConfigured(configured)
    }
    checkAIConfig()
  }, [])

  // 同步当前选择的词库
  useEffect(() => {
    if (currentBook) {
      setSelectedBookId(currentBook.id)
    }
  }, [currentBook])

  // 获取当前选择的词库对象（从所有词库中查找，包括内置词库）
  const getSelectedBook = () => {
    return books.find(book => book.id === selectedBookId)
  }

  // 搜索单词
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResult(null)
      setShowWordInfo(false)
      setAddedToBook(false)
      return
    }

    setIsSearching(true)
    setAddedToBook(false)

    try {
      const result = await dictionaryService.fetchWord(query)
      setSearchResult(result)
      setShowWordInfo(!!result)

      // 检查是否已在选择的词库中
      if (result && selectedBookId) {
        const selectedBook = getSelectedBook()
        const isInBook = selectedBook?.wordIds?.includes(result.id) || false
        setAddedToBook(isInBook)
      }
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchResult(null)
      setShowWordInfo(false)
    } finally {
      setIsSearching(false)
    }
  }

  // 防抖搜索（仅在非空时延迟搜索）
  useEffect(() => {
    if (!searchQuery.trim()) {
      handleSearch('')
      return
    }

    const timer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 处理回车键立即搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 清除防抖定时器并立即搜索
      handleSearch(searchQuery)
    }
  }

  // 添加到选择的词库
  const handleAddToBook = async () => {
    const selectedBook = getSelectedBook()
    if (searchResult && selectedBook && !addedToBook) {
      try {
        // 先保存单词到存储
        await addWord(searchResult)
        // 再添加到词库（addWordToBook 会自动触发跨窗口同步）
        await addWordToBook(selectedBook.id, searchResult.id)
        setAddedToBook(true)
      } catch (error) {
        console.error('添加单词失败:', error)
      }
    }
  }

  // 选择词库
  const handleSelectBook = async (bookId: string) => {
    setSelectedBookId(bookId)
    setShowBookSelector(false)
    // 同时更新全局的当前词库
    await selectBook(bookId)
    // 重新检查单词是否已在词库中
    if (searchResult) {
      const book = books.find(b => b.id === bookId)
      const isInBook = book?.wordIds?.includes(searchResult.id) || false
      setAddedToBook(isInBook)
    }
  }

  // 播放发音
  const handlePlayAudio = async () => {
    if (searchResult) {
      try {
        await voiceService.play(searchResult.word, settings.pronunciation)
      } catch (error) {
        console.error('播放发音失败:', error)
      }
    }
  }

  // 关闭窗口
  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.hideFloatingWindow()
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* 拖拽区域和标题栏 */}
      <div className="floating-title-bar flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 shadow-sm cursor-move select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Muse 悬浮查词</h1>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors floating-no-drag"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* 搜索区域 */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* 词库选择器 */}
        {customBooks.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBookSelector(!showBookSelector)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {getSelectedBook()?.name || '选择词库'}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showBookSelector ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 词库下拉列表 */}
            {showBookSelector && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {customBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                      book.id === selectedBookId
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{book.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {book.wordCount || 0} 词
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索单词..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            autoFocus
          />
        </div>

        {/* 搜索结果 */}
        {showWordInfo && searchResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3">
            {/* 单词标题 */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {searchResult.word}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {settings.pronunciation === 'us'
                    ? searchResult.phonetic?.us || searchResult.phonetic?.uk
                    : searchResult.phonetic?.uk || searchResult.phonetic?.us}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePlayAudio}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="播放发音"
                >
                  <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {getSelectedBook() && (
                  <button
                    onClick={handleAddToBook}
                    disabled={addedToBook}
                    className={`p-2 rounded-lg transition-colors ${
                      addedToBook
                        ? 'bg-green-100 dark:bg-green-900 cursor-default'
                        : 'hover:bg-purple-100 dark:hover:bg-purple-900'
                    }`}
                    title={addedToBook ? '已添加' : '添加到词库'}
                  >
                    {addedToBook ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 释义 */}
            <div className="space-y-2">
              {searchResult.meanings?.map((meaning: any, index: number) => {
                const needsTranslation = !meaning.translation ||
                  meaning.translation === '待补充' ||
                  meaning.translation === '待翻译' ||
                  meaning.translation === 'unknown'

                return (
                  <div key={index} className="border-l-2 border-purple-500 pl-3">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {meaning.partOfSpeech}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {meaning.translation}
                    </p>
                    {meaning.definition && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                        {meaning.definition}
                      </p>
                    )}
                    {needsTranslation && !meaning.definition && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        配置 AI 服务以获取完整释义
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 例句 */}
            {searchResult.examples && searchResult.examples.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  例句
                </h3>
                <div className="space-y-1">
                  {searchResult.examples.slice(0, 2).map((example: string, index: number) => (
                    <p key={index} className="text-xs text-gray-600 dark:text-gray-400 italic">
                      • {example}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 词根词缀 */}
            {searchResult.rootAnalysis && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                  词根词缀
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-300">{searchResult.rootAnalysis}</p>
              </div>
            )}

            {/* 标签 */}
            {searchResult.tags && searchResult.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {searchResult.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* AI 未配置提示 */}
            {!isAIConfigured && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      AI 服务未配置
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">
                      配置 AI 服务以获得更完整的单词释义、词根词缀分析和记忆技巧。
                    </p>
                    <button
                      onClick={() => {
                        if (window.electronAPI) {
                          // 在 Electron 中打开设置页面
                          window.location.hash = '/settings'
                        }
                      }}
                      className="text-xs bg-yellow-600 dark:bg-yellow-700 text-white px-3 py-1.5 rounded hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      前往设置
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 无搜索结果 */}
        {searchQuery && !isSearching && !showWordInfo && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              未找到单词 "{searchQuery}"
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              请检查拼写或尝试其他单词
            </p>
          </div>
        )}

        {/* 初始状态 */}
        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              输入单词开始查询
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              快捷键: Alt + X
            </p>
            {customBooks.length === 0 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                请先创建一个自定义词库
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
