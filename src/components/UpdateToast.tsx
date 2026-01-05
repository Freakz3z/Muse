import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Check, AlertCircle, Sparkles } from 'lucide-react'

interface UpdateInfo {
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  downloadUrl?: string
  notes?: string
}

interface UpdateToastProps {
  updateInfo: UpdateInfo | null
  onClose: () => void
}

export function UpdateToast({ updateInfo, onClose }: UpdateToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (updateInfo?.hasUpdate) {
      setIsVisible(true)
      // 10秒后自动关闭
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [updateInfo, onClose])

  if (!updateInfo || !updateInfo.hasUpdate) {
    return null
  }

  const handleDownload = () => {
    if (updateInfo.downloadUrl && window.electronAPI) {
      window.electronAPI.openDownloadPage(updateInfo.downloadUrl)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4"
        >
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-blue-700 dark:via-purple-700 dark:to-pink-600 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* 闪光装饰 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* 通知内容 */}
            <div className="relative p-5">
              <div className="flex items-start gap-4">
                {/* 图标 */}
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-white">
                      发现新版本 🎉
                    </h3>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                      className="text-xs bg-white/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full font-medium shadow-sm"
                    >
                      v{updateInfo.latestVersion}
                    </motion.span>
                  </div>
                  <p className="text-sm text-blue-100 mb-3">
                    当前版本 v{updateInfo.currentVersion} · 有新版本可用
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      立即更新
                    </button>
                    <button
                      onClick={() => {
                        setIsVisible(false)
                        setTimeout(onClose, 300)
                      }}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      title="稍后提醒"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 进度条装饰 */}
            <div className="h-1.5 bg-white/20 backdrop-blur-sm">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 10, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-white/80 to-white/40"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface CheckUpdateToastProps {
  isChecking: boolean
  hasUpdate: boolean
  latestVersion?: string
  onDismiss: () => void
}

export function CheckUpdateToast({ isChecking, hasUpdate, latestVersion, onDismiss }: CheckUpdateToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isChecking) {
      setIsVisible(true)
      // 5秒后自动关闭
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isChecking, onDismiss])

  if (isChecking) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 w-10 h-10 border-3 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-white">正在检查更新...</span>
                    <p className="text-xs text-gray-400 mt-0.5">请稍候片刻</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (!hasUpdate) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">已是最新版本 ✨</p>
                    <p className="text-xs text-green-100 mt-0.5">当前版本 v{latestVersion}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsVisible(false)
                      setTimeout(onDismiss, 300)
                    }}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return null
}

interface ErrorToastProps {
  message: string
  onDismiss: () => void
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
        >
          <div className="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <AlertCircle className="w-5 h-5 text-white" />
                </motion.div>
                <p className="text-sm font-medium text-white flex-1">{message}</p>
                <button
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onDismiss, 300)
                  }}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
