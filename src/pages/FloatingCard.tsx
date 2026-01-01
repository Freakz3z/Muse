import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store'
import { Word } from '../types'

export default function FloatingCard() {
  const { words, records, settings } = useAppStore()
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [showMeaning, setShowMeaning] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  // 获取待复习或随机单词
  const getDisplayWords = (): Word[] => {
    const now = Date.now()
    const dueWordIds = Array.from(records.values())
      .filter(r => r.nextReviewAt <= now)
      .map(r => r.wordId)
    
    let displayWords = words.filter(w => dueWordIds.includes(w.id))
    
    if (displayWords.length === 0) {
      displayWords = words.slice(0, 20)
    }
    
    return displayWords
  }

  useEffect(() => {
    const displayWords = getDisplayWords()
    if (displayWords.length > 0) {
      setCurrentWord(displayWords[0])
    }
  }, [words, records])

  const handleNext = () => {
    const displayWords = getDisplayWords()
    const nextIndex = (wordIndex + 1) % displayWords.length
    setWordIndex(nextIndex)
    setCurrentWord(displayWords[nextIndex])
    setShowMeaning(false)
  }

  const handlePrev = () => {
    const displayWords = getDisplayWords()
    const prevIndex = wordIndex === 0 ? displayWords.length - 1 : wordIndex - 1
    setWordIndex(prevIndex)
    setCurrentWord(displayWords[prevIndex])
    setShowMeaning(false)
  }

  const playAudio = () => {
    if (!currentWord) return
    const utterance = new SpeechSynthesisUtterance(currentWord.word)
    utterance.lang = settings.pronunciation === 'us' ? 'en-US' : 'en-GB'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  const handleClose = () => {
    window.electronAPI?.closeFloating()
  }

  if (!currentWord) {
    return (
      <div className="h-screen flex items-center justify-center bg-white/90 backdrop-blur rounded-xl">
        <p className="text-gray-400">暂无单词</p>
      </div>
    )
  }

  return (
    <div className="h-screen p-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full bg-white/95 backdrop-blur rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ 
          WebkitAppRegion: 'drag',
          cursor: 'move'
        } as any}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-r from-blue-500 to-purple-500">
          <span className="text-white text-xs font-medium">Muse 单词卡</span>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* 单词内容 */}
        <div 
          className="flex-1 p-4 flex flex-col items-center justify-center"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{currentWord.word}</h2>
            <p className="text-gray-400 text-sm mb-3">{currentWord.phonetic.us}</p>
            
            {showMeaning ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {currentWord.meanings.slice(0, 2).map((meaning, index) => (
                  <p key={index} className="text-gray-700 text-sm">
                    <span className="text-blue-500">{meaning.partOfSpeech}</span> {meaning.translation}
                  </p>
                ))}
              </motion.div>
            ) : (
              <button
                onClick={() => setShowMeaning(true)}
                className="text-blue-500 text-sm hover:underline"
              >
                点击查看释义
              </button>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-t bg-gray-50"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <button
            onClick={handlePrev}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          
          <button
            onClick={playAudio}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-blue-500" />
          </button>
          
          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
