import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  MessageSquare,
  Loader2,
  X,
  Copy,
  Check
} from 'lucide-react'
import { aiService } from '../services/ai'
import { GeneratedExample, WordMeaningExplanation } from '../services/ai/types'
import { Word } from '../types'

interface AIAssistantProps {
  word: Word
  isOpen?: boolean
  onClose?: () => void
}

type TabType = 'examples' | 'explanation' | 'memory'

export default function AIAssistant({ word, isOpen = true, onClose }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<TabType>('examples')
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 数据状态
  const [examples, setExamples] = useState<GeneratedExample[]>([])
  const [explanation, setExplanation] = useState<WordMeaningExplanation | null>(null)
  const [memoryTip, setMemoryTip] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsConfigured(aiService.isConfigured())
  }, [])

  useEffect(() => {
    // 重置状态当单词变化时
    setExamples([])
    setExplanation(null)
    setMemoryTip('')
    setError(null)
  }, [word.id])

  const handleGenerateExamples = async () => {
    if (!isConfigured) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await aiService.generateExamplesWithTranslation(word.word)
      setExamples(result)
    } catch (err) {
      setError('生成例句失败，请稍后重试')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateExplanation = async () => {
    if (!isConfigured) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await aiService.explainWordMeaning(word.word)
      setExplanation(result)
    } catch (err) {
      setError('生成解释失败，请稍后重试')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateMemoryTip = async () => {
    if (!isConfigured) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await aiService.generateMemoryTip(word.word)
      setMemoryTip(result)
    } catch (err) {
      setError('生成记忆技巧失败，请稍后重试')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    // 自动加载内容
    if (tab === 'examples' && examples.length === 0) {
      handleGenerateExamples()
    } else if (tab === 'explanation' && !explanation) {
      handleGenerateExplanation()
    } else if (tab === 'memory' && !memoryTip) {
      handleGenerateMemoryTip()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  if (!isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">AI 智能助手</h3>
            <p className="text-sm text-gray-500">需要配置 AI 服务</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          前往设置页面配置 AI 服务后，即可使用智能例句生成、词义解释、记忆技巧等功能。
        </p>
        <a 
          href="#/settings" 
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          前往设置 →
        </a>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI 智能助手</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-100">
        {[
          { key: 'examples', label: '智能例句', icon: MessageSquare },
          { key: 'explanation', label: '词义解释', icon: BookOpen },
          { key: 'memory', label: '记忆技巧', icon: Lightbulb },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="p-4 min-h-[200px]">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>AI 正在思考中...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'examples' && (
              <motion.div
                key="examples"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {examples.length > 0 ? (
                  <div className="space-y-4">
                    {examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-800 leading-relaxed">
                            {example.sentence}
                          </p>
                          <button
                            onClick={() => copyToClipboard(example.sentence)}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                        {example.translation && (
                          <p className="text-gray-500 text-sm mt-2">{example.translation}</p>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleGenerateExamples}
                      className="w-full py-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      换一批例句
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">点击生成与 "{word.word}" 相关的实用例句</p>
                    <button
                      onClick={handleGenerateExamples}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      生成例句
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'explanation' && (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {explanation ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">基本释义</h4>
                      <p className="text-gray-800">{explanation.basicMeaning}</p>
                    </div>
                    
                    {explanation.detailedExplanation && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">详细解释</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {explanation.detailedExplanation}
                        </p>
                      </div>
                    )}

                    {explanation.usageNotes && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-blue-700 mb-1">💡 用法要点</h4>
                        <p className="text-blue-800 text-sm">{explanation.usageNotes}</p>
                      </div>
                    )}

                    {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-orange-700 mb-2">⚠️ 常见错误</h4>
                        <ul className="space-y-1">
                          {explanation.commonMistakes.map((mistake, index) => (
                            <li key={index} className="text-orange-800 text-sm flex items-start gap-2">
                              <span>•</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {explanation.culturalNotes && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-purple-700 mb-1">🌍 文化背景</h4>
                        <p className="text-purple-800 text-sm">{explanation.culturalNotes}</p>
                      </div>
                    )}

                    <button
                      onClick={handleGenerateExplanation}
                      className="w-full py-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      重新生成
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">AI 将深入解释 "{word.word}" 的含义和用法</p>
                    <button
                      onClick={handleGenerateExplanation}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      生成解释
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'memory' && (
              <motion.div
                key="memory"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {memoryTip ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">记忆技巧</h4>
                          <p className="text-gray-700 leading-relaxed">{memoryTip}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateMemoryTip}
                      className="w-full py-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      换一个技巧
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">AI 将为你生成 "{word.word}" 的记忆技巧</p>
                    <button
                      onClick={handleGenerateMemoryTip}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      生成记忆技巧
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
