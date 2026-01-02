import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileJson, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { validateJSONFormat, importWords } from '../utils/word-import'
import { useAppStore } from '../store'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [jsonContent, setJsonContent] = useState('')
  const [validation, setValidation] = useState<{
    valid: boolean
    wordCount: number
    error?: string
  } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { words, addWord } = useAppStore()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      setJsonContent(content)
      setValidation(null)
      setImportResult(null)
    } catch (error) {
      console.error('读取文件失败:', error)
    }
  }

  const handleValidate = () => {
    if (!jsonContent.trim()) {
      setValidation({ valid: false, wordCount: 0, error: '请输入或上传 JSON 内容' })
      return
    }
    const result = validateJSONFormat(jsonContent)
    setValidation(result)
  }

  const handleImport = async () => {
    if (!validation?.valid) {
      handleValidate()
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const result = await importWords(jsonContent, words, addWord)
      setImportResult(result)
    } catch (error) {
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : '导入失败']
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setJsonContent('')
    setValidation(null)
    setImportResult(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">导入词库</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6 flex-1 overflow-auto">
            {/* 格式说明 */}
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="text-sm font-medium text-blue-700 mb-2">支持的 JSON 格式</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-blue-500 mb-1 font-medium uppercase">推荐格式 (完整数据)</p>
                  <pre className="text-[10px] text-blue-600 bg-blue-100/50 p-2 rounded-lg overflow-x-auto h-24">
{`[
  {
    "word": "apple",
    "meanings": [...],
    "examples": [...]
  }
]`}
                  </pre>
                </div>
                <div>
                  <p className="text-[10px] text-blue-500 mb-1 font-medium uppercase">简易格式 (仅单词)</p>
                  <pre className="text-[10px] text-blue-600 bg-blue-100/50 p-2 rounded-lg overflow-x-auto h-24">
{`{
  "abandon": 1,
  "ability": 1,
  "accept": 2
}`}
                  </pre>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                提示: 推荐使用从本应用导出的 JSON 文件，可保留完整的释义、例句等信息。
              </p>
            </div>

            {/* 文件上传 */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-blue-500"
              >
                <Upload className="w-5 h-5" />
                点击上传 JSON 文件
              </button>
            </div>

            {/* JSON 输入框 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                或直接粘贴 JSON 内容
              </label>
              <textarea
                value={jsonContent}
                onChange={e => {
                  setJsonContent(e.target.value)
                  setValidation(null)
                  setImportResult(null)
                }}
                placeholder='[{"word": "apple", "meanings": [...]}, ...] 或 {"apple": 1, ...}'
                className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
            </div>

            {/* 验证结果 */}
            {validation && (
              <div className={`mb-4 p-4 rounded-xl ${
                validation.valid 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-red-50 border border-red-100'
              }`}>
                <div className="flex items-center gap-2">
                  {validation.valid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700 font-medium">
                        格式正确，共 {validation.wordCount} 个单词
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{validation.error}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 导入结果 */}
            {importResult && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="font-medium text-gray-800 mb-2">导入完成</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">成功导入:</span>
                    <span className="font-medium text-green-600">{importResult.imported}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-gray-600">已跳过:</span>
                    <span className="font-medium text-yellow-600">{importResult.skipped}</span>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-sm font-medium mb-1">错误信息:</p>
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-red-500 text-xs">{err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleValidate}
              disabled={!jsonContent.trim() || isImporting}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              验证格式
            </button>
            <button
              onClick={handleImport}
              disabled={!validation?.valid || isImporting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  导入中...
                </>
              ) : (
                '开始导入'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
