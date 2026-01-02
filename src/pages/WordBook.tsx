import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  BookOpen, 
  Check,
  FolderOpen,
  Upload,
  CheckCircle2,
  Eye,
  Sparkles,
  Trash2
} from 'lucide-react'
import { useAppStore } from '../store'
import { WordBook } from '../types'
import ImportModal from '../components/ImportModal'
import WordListModal from '../components/WordListModal'
import AIGenerateModal from '../components/AIGenerateModal'

export default function WordBookPage() {
  const { books, currentBook, selectBook, createBook } = useAppStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false)
  const [showWordList, setShowWordList] = useState(false)
  const [viewingBook, setViewingBook] = useState<WordBook | null>(null)
  const [newBookName, setNewBookName] = useState('')
  const [newBookDesc, setNewBookDesc] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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
            onClick={() => setShowAIGenerateModal(true)}
            disabled={!currentBook}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            AI 生成
          </button>
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
            <BookOpen className="w-5 h-5 text-blue-500" />
            内置词库
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {builtinBooks.map((book) => (
              <WordBookCard
                key={book.id}
                book={book}
                isSelected={currentBook?.id === book.id}
                onSelect={() => selectBook(book.id)}
                onViewWords={() => {
                  setViewingBook(book)
                  setShowWordList(true)
                }}
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
                onViewWords={() => {
                  setViewingBook(book)
                  setShowWordList(true)
                }}
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

      {/* AI 生成单词弹窗 */}
      {currentBook && (
        <AIGenerateModal 
          isOpen={showAIGenerateModal} 
          onClose={() => setShowAIGenerateModal(false)} 
          bookId={currentBook.id}
          bookName={currentBook.name}
        />
      )}

      {/* 查看词库单词列表弹窗 */}
      <WordListModal 
        isOpen={showWordList} 
        onClose={() => {
          setShowWordList(false)
          setViewingBook(null)
        }} 
        book={viewingBook}
      />
    </div>
  )
}

interface WordBookCardProps {
  book: WordBook
  isSelected: boolean
  onSelect: () => void
  canDelete?: boolean
  onViewWords?: () => void
}

function WordBookCard({ 
  book, 
  isSelected, 
  onSelect, 
  onViewWords,
  canDelete
}: WordBookCardProps) {
  const { deleteBook } = useAppStore()
  
  const handleViewWords = (e: React.MouseEvent) => {
    e.stopPropagation()
    onViewWords?.()
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`确定要删除词库 "${book.name}" 吗？`)) {
      await deleteBook(book.id)
    }
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
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: book.color || '#3b82f6' }}
        >
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate pr-6">{book.name}</h3>
          <p className="text-gray-500 text-sm truncate mb-3">{book.description || '暂无描述'}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {book.wordCount > 0 && (
                <button
                  onClick={handleViewWords}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看单词
                </button>
              )}
            </div>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="删除词库"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
