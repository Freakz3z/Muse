import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, Plus, Loader2, Sparkles } from 'lucide-react'
import { aiService } from '../services/ai'
import { useAppStore } from '../store'

interface TranslationPopupProps {
  text: string
  onClose: () => void
}

interface TranslationResult {
  original: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
  examples?: string[]
}

export default function TranslationPopup({ text, onClose }: TranslationPopupProps) {
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addWord, words } = useAppStore()

  const isWordExists = words.some(w => w.word.toLowerCase() === text.toLowerCase())

  useEffect(() => {
    const translate = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        if (aiService.isConfigured()) {
          // 使用 AI 翻译
          const translation = await aiService.translate(text, 'zh')
          setResult({
            original: text,
            translation: translation,
            phonetic: `/${text}/`, // 简化音标
          })
        } else {
          // 无 AI 配置时的简单翻译提示
          setResult({
            original: text,
            translation: '请配置 AI 服务以获取翻译',
          })
        }
      } catch (err) {
        setError('翻译失败，请检查网络或 AI 配置')
        console.error('Translation error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (text) {
      translate()
    }
  }, [text])

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    speechSynthesis.speak(utterance)
  }

  const handleAddToWordBook = async () => {
    if (!result) return
    
    const newWord = {
      id: `custom_${Date.now()}`,
      word: text,
      phonetic: {
        us: result.phonetic || '',
        uk: result.phonetic || '',
      },
      meanings: [{
        partOfSpeech: 'unknown',
        definition: '',
        translation: result.translation,
      }],
      examples: result.examples || [],
      synonyms: [],
      antonyms: [],
      collocations: [],
      tags: ['用户添加'],
      frequency: 'medium' as const,
    }
    
    await addWord(newWord)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[90vw] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm font-medium">快速翻译</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">正在翻译...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-500 text-sm hover:underline"
                >
                  重试
                </button>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* 原文 */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{result.original}</h3>
                    {result.phonetic && (
                      <p className="text-gray-500 text-sm mt-1">{result.phonetic}</p>
                    )}
                  </div>
                  <button
                    onClick={playAudio}
                    className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 transition-colors"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 翻译结果 */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 text-lg">{result.translation}</p>
                </div>

                {/* 添加到词库按钮 */}
                <button
                  onClick={handleAddToWordBook}
                  disabled={isWordExists}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    isWordExists
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {isWordExists ? '已在词库中' : '添加到词库'}
                </button>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
