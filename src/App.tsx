import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from './store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Review from './pages/Review'
import WordBook from './pages/WordBook'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import About from './pages/About'
import AIQuiz from './pages/AIQuiz'
import SearchPage from './pages/SearchPage'
import SplashScreen from './components/SplashScreen'

function App() {
  const initialize = useAppStore((state) => state.initialize)
  const isLoading = useAppStore((state) => state.isLoading)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>
      
      {!isLoading && (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="learn" element={<Learn />} />
            <Route path="review" element={<Review />} />
            <Route path="quiz" element={<AIQuiz />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="wordbook" element={<WordBook />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      )}
    </>
  )
}

export default App
