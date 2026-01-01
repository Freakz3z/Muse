import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  RefreshCw, 
  FileQuestion, 
  Library, 
  BarChart3, 
  Settings,
  Minus,
  Square,
  X,
  Brain,
  Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/learn', icon: BookOpen, label: '学习' },
  { path: '/review', icon: RefreshCw, label: '复习' },
  { path: '/quiz', icon: FileQuestion, label: '测验' },
  { path: '/ai-quiz', icon: Brain, label: 'AI测验' },
  { path: '/ai-coach', icon: Sparkles, label: 'AI教练' },
  { path: '/wordbook', icon: Library, label: '词库' },
  { path: '/statistics', icon: BarChart3, label: '统计' },
  { path: '/settings', icon: Settings, label: '设置' },
]

export default function Layout() {
  const location = useLocation()

  const handleMinimize = () => window.electronAPI?.minimize()
  const handleMaximize = () => window.electronAPI?.maximize()
  const handleClose = () => window.electronAPI?.close()

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 标题栏 */}
      <header className="h-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-4 drag-region">
        <div className="flex items-center gap-2 no-drag">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">Muse</span>
        </div>
        
        <div className="flex items-center gap-1 no-drag">
          <button
            onClick={handleMinimize}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <Square className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边导航 */}
        <nav className="w-20 bg-white/60 backdrop-blur-sm border-r border-gray-200 py-4 flex flex-col items-center gap-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <NavLink
                key={path}
                to={path}
                className={`
                  w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-500 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
