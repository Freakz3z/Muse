import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Sparkles, Loader2, BookOpen, Lightbulb, Link, Brain } from 'lucide-react'
import { Word } from '../types'
import { aiService } from '../services/ai'
import { voiceService } from '../services/voice'

interface WordCardProps {
  word: Word
  showAnswer?: boolean
  onFlip?: () => void
  pronunciation?: 'us' | 'uk'
}

export default function WordCard({ 
  word, 
  showAnswer = false, 
  onFlip, 
  pronunciation = 'us'
}: WordCardProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer)
  const [isGenerating, setIsGenerating] = useState(false)
  const [memoryTip, setMemoryTip] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'meaning' | 'examples' | 'related'>('meaning')

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
  }

  const playAudio = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await voiceService.play(word.word, pronunciation)
    } catch (error) {
      console.error('Audio playback failed:', error)
    }
  }

  const handleAIGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!aiService.isConfigured()) {
      alert('请先在设置中配置 AI 服务')
      return
    }

    setIsGenerating(true)
    try {
      const tip = await aiService.generateMemoryTip(word.word)
      setMemoryTip(tip)
    } catch (error) {
      console.error('AI 生成失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000">
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ 
          transformStyle: 'preserve-3d',
          minHeight: '420px'
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        onClick={handleFlip}
      >
        {/* 正面 - 单词 */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-full bg-white rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden border border-gray-100">
            {/* 顶部装饰 */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <div className="p-8 flex flex-col items-center justify-center h-full">
              {/* 单词 */}
              <motion.h1 
                className="text-6xl font-bold text-gray-800 mb-6 tracking-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                {word.word}
              </motion.h1>
              
              {/* 音标和发音 */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-xs text-gray-400 font-medium">US</span>
                  <span className="text-gray-600">{word.phonetic.us}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playAudio}
                  className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-shadow"
                >
                  <Volume2 className="w-6 h-6" />
                </motion.button>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-xs text-gray-400 font-medium">UK</span>
                  <span className="text-gray-600">{word.phonetic.uk}</span>
                </div>
              </div>

              {/* 词频标签 */}
              <div className="flex items-center gap-2 mb-6">
                {word.tags?.slice(0, 3).map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {word.frequency && (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    word.frequency === 'high' ? 'bg-green-50 text-green-600' :
                    word.frequency === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {word.frequency === 'high' ? '高频' : word.frequency === 'medium' ? '中频' : '低频'}
                  </span>
                )}
              </div>

              {/* 提示 */}
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gray-200 rounded" />
                点击卡片查看释义
                <span className="w-8 h-0.5 bg-gray-200 rounded" />
              </p>
            </div>
          </div>
        </div>

        {/* 背面 - 释义 */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-full bg-white rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden border border-gray-100">
            {/* 顶部标题栏 */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">{word.word}</h2>
                  <span className="text-white/70 text-sm">{word.phonetic.us}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playAudio}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <Volume2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* 标签页切换 */}
            <div className="flex border-b border-gray-100 px-4" onClick={e => e.stopPropagation()}>
              {[
                { id: 'meaning', icon: BookOpen, label: '释义' },
                { id: 'examples', icon: Lightbulb, label: '例句' },
                { id: 'related', icon: Link, label: '相关' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="p-5 overflow-auto" style={{ maxHeight: '280px' }} onClick={e => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                {activeTab === 'meaning' && (
                  <motion.div
                    key="meaning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {word.meanings.map((meaning, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="shrink-0 px-2 py-1 h-fit bg-blue-100 text-blue-700 text-xs font-bold rounded">
                          {meaning.partOfSpeech}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-500 text-sm mb-1">{meaning.definition}</p>
                          <p className="text-gray-800 font-medium">{meaning.translation}</p>
                        </div>
                      </div>
                    ))}

                    {/* AI 记忆技巧 */}
                    {memoryTip ? (
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-600 text-sm font-medium mb-2">
                          <Brain className="w-4 h-4" />
                          AI 记忆技巧
                        </div>
                        <p className="text-gray-700 text-sm">{memoryTip}</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {isGenerating ? 'AI 生成中...' : 'AI 生成记忆技巧'}
                      </button>
                    )}
                  </motion.div>
                )}

                {activeTab === 'examples' && (
                  <motion.div
                    key="examples"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {word.examples.length > 0 ? (
                      word.examples.map((example, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-gray-700 italic leading-relaxed">"{example}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        暂无例句
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'related' && (
                  <motion.div
                    key="related"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {word.synonyms.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">同义词</h4>
                        <div className="flex flex-wrap gap-2">
                          {word.synonyms.map((syn, i) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {word.antonyms.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">反义词</h4>
                        <div className="flex flex-wrap gap-2">
                          {word.antonyms.map((ant, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full">
                              {ant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {word.collocations.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">常见搭配</h4>
                        <div className="flex flex-wrap gap-2">
                          {word.collocations.map((col, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {word.rootAnalysis && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <h4 className="text-xs font-medium text-amber-700 uppercase mb-2">词根分析</h4>
                        <p className="text-gray-700 text-sm">{word.rootAnalysis}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
