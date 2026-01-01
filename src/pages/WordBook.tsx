import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  Edit3,
  Check,
  X,
  FolderOpen,
  Upload,
  Download,
  Loader2,
  Cloud,
  CheckCircle2
} from 'lucide-react'
import { useAppStore } from '../store'
import { WordBook } from '../types'
import ImportModal from '../components/ImportModal'
import { initializeWordBook, presetWordLists } from '../data/words'
import { wordStorage, bookStorage } from '../storage'

export default function WordBookPage() {
  const { books, currentBook, selectBook, createBook, loadWords, loadBooks } = useAppStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newBookName, setNewBookName] = useState('')
  const [newBookDesc, setNewBookDesc] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // 加载状态
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null)
  const [loadProgress, setLoadProgress] = useState({ current: 0, total: 0 })
  
  // 加载词库单词
  const handleLoadBook = useCallback(async (bookId: string) => {
    setLoadingBookId(bookId)
    setLoadProgress({ current: 0, total: 0 })
    
    try {
      const wordIds = await initializeWordBook(
        bookId,
        { 
          save: wordStorage.save.bind(wordStorage), 
          getAll: wordStorage.getAll.bind(wordStorage) 
        },
        (current, total) => setLoadProgress({ current, total })
      )
      
      // 更新词库的wordIds
      const book = books.find(b => b.id === bookId)
      if (book && wordIds.length > 0) {
        const updatedBook = { ...book, wordIds, wordCount: wordIds.length }
        await bookStorage.save(updatedBook)
        await loadBooks()
        await loadWords()
      }
    } catch (error) {
      console.error('加载词库失败:', error)
    } finally {
      setLoadingBookId(null)
      setLoadProgress({ current: 0, total: 0 })
    }
  }, [books, loadBooks, loadWords])
  
  // 检查词库是否需要加载（未下载或未完成）
  const needsLoading = (book: WordBook) => {
    const listKey = book.id.replace('book_', '')
    const presetList = presetWordLists[listKey]
    if (!presetList) return false
    // 如果已下载数量小于预设词数的90%，认为需要加载
    return book.wordIds.length < presetList.length * 0.9
  }
  
  // 获取预设词数
  const getPresetCount = (book: WordBook) => {
    const listKey = book.id.replace('book_', '')
    return presetWordLists[listKey]?.length || 0
  }

  const handleCreateBook = async () => {
    if (!newBookName.trim()) return
    
    await createBook({
      name: newBookName.trim(),
      description: newBookDesc.trim(),
      category: 'custom',
      wordCount: 0,
      wordIds: [],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    })
    
    setNewBookName('')
    setNewBookDesc('')
    setShowCreateModal(false)
  }

  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const builtinBooks = filteredBooks.filter(b => b.category === 'builtin')
  const customBooks = filteredBooks.filter(b => b.category === 'custom')

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">词库管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            当前词库: <span className="text-blue-500 font-medium">{currentBook?.name || '未选择'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            <Plus className="w-4 h-4" />
            创建词库
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            导入词库
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索词库..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* 内置词库 */}
      {builtinBooks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            内置词库
            <span className="text-sm text-gray-400 font-normal">（点击下载按钮加载词库数据）</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {builtinBooks.map((book) => (
              <WordBookCard
                key={book.id}
                book={book}
                isSelected={currentBook?.id === book.id}
                onSelect={() => selectBook(book.id)}
                needsLoading={needsLoading(book)}
                isLoading={loadingBookId === book.id}
                loadProgress={loadingBookId === book.id ? loadProgress : undefined}
                onLoad={() => handleLoadBook(book.id)}
                presetCount={getPresetCount(book)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 自定义词库 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">我的词库</h2>
        {customBooks.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {customBooks.map((book) => (
              <WordBookCard
                key={book.id}
                book={book}
                isSelected={currentBook?.id === book.id}
                onSelect={() => selectBook(book.id)}
                canDelete
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无自定义词库</p>
            <p className="text-gray-400 text-sm mt-1">点击上方按钮创建你的第一个词库</p>
          </div>
        )}
      </div>

      {/* 创建词库弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">创建新词库</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">词库名称</label>
                <input
                  type="text"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="输入词库名称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-600 text-sm mb-2">描述（可选）</label>
                <textarea
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="输入词库描述"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateBook}
                disabled={!newBookName.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 导入词库弹窗 */}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  )
}

interface WordBookCardProps {
  book: WordBook
  isSelected: boolean
  onSelect: () => void
  canDelete?: boolean
  needsLoading?: boolean
  isLoading?: boolean
  loadProgress?: { current: number; total: number }
  onLoad?: () => void
  presetCount?: number
}

function WordBookCard({ 
  book, 
  isSelected, 
  onSelect, 
  canDelete,
  needsLoading,
  isLoading,
  loadProgress,
  onLoad,
  presetCount
}: WordBookCardProps) {
  const handleLoadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLoad?.()
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        relative bg-white rounded-xl p-5 cursor-pointer transition-all
        ${isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' 
          : 'shadow-sm hover:shadow-md'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: book.color || '#3b82f6' }}
        >
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{book.name}</h3>
          <p className="text-gray-500 text-sm truncate">{book.description || '暂无描述'}</p>
          
          {/* 加载状态 */}
          {isLoading ? (
            <div className="mt-3">
              <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在从API加载词汇...
              </div>
              {loadProgress && loadProgress.total > 0 && (
                <>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(loadProgress.current / loadProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {loadProgress.current} / {loadProgress.total}
                  </p>
                </>
              )}
            </div>
          ) : needsLoading ? (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={handleLoadClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {book.wordIds.length > 0 ? '继续下载' : '下载词库数据'}
                </button>
                <span className="text-gray-400 text-xs">需要网络</span>
              </div>
              {book.wordIds.length > 0 && presetCount && (
                <p className="text-xs text-gray-400">
                  已下载 {book.wordIds.length} / {presetCount} 词
                </p>
              )}
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-gray-500 text-sm">{book.wordCount} 个单词</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
