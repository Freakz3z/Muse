import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  isVisible: boolean
  onClose: () => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

export default function Toast({ type, message, isVisible, onClose }: ToastProps) {
  const Icon = icons[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-lg max-w-sm`}
        >
          <Icon className={`w-5 h-5 ${iconColors[type]}`} />
          <p className="text-sm font-medium">{message}</p>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
