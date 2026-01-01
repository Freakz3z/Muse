import { useEffect, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAppStore } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Review from './pages/Review'
import Quiz from './pages/Quiz'
import WordBook from './pages/WordBook'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import TranslationPopup from './components/TranslationPopup'
import AIQuiz from './pages/AIQuiz'
import AICoach from './pages/AICoach'

function App() {
  const initialize = useAppStore((state) => state.initialize)
  const isLoading = useAppStore((state) => state.isLoading)
  const [translationText, setTranslationText] = useState<string | null>(null)

  // 监听来自主进程的剪贴板翻译事件
  useEffect(() => {
    const handleClipboardTranslate = (_event: any, text: string) => {
      if (text && text.trim()) {
        setTranslationText(text.trim())
      }
    }

    // 监听 IPC 事件
    window.electronAPI?.onClipboardTranslate?.(handleClipboardTranslate)

    return () => {
      window.electronAPI?.removeClipboardTranslateListener?.()
    }
  }, [])

  // 关闭翻译弹窗
  const closeTranslation = useCallback(() => {
    setTranslationText(null)
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<Learn />} />
          <Route path="review" element={<Review />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="ai-quiz" element={<AIQuiz />} />
          <Route path="ai-coach" element={<AICoach />} />
          <Route path="wordbook" element={<WordBook />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {/* 剪贴板翻译弹窗 */}
      {translationText && (
        <TranslationPopup text={translationText} onClose={closeTranslation} />
      )}
    </>
  )
}

export default App
