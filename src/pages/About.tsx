import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Bug, Sparkles, AlertCircle, Download } from 'lucide-react'
import logo from '/Muse.png'
import CHANGELOG_RAW from '../../CHANGELOG.md?raw'

// 更新日志数据类型
interface VersionInfo {
  version: string
  date: string
  features: string[]
  fixes: string[]
  knownIssues?: string[]
}

// 解析 CHANGELOG.md 文件
function parseChangelog(): VersionInfo[] {
  const versions: VersionInfo[] = []

  // 匹配版本标题的正则，例如: ## [1.6.1] - 2026-01-05
  const versionRegex = /##\s*\[([\d.]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/
  const lines = CHANGELOG_RAW.split('\n')

  let currentVersion: VersionInfo | null = null
  let currentSection: 'features' | 'fixes' | 'knownIssues' | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // 跳过分隔线和空行
    if (!trimmedLine || trimmedLine === '---') {
      continue
    }

    // 检查是否是新的版本
    const versionMatch = trimmedLine.match(versionRegex)
    if (versionMatch) {
      // 保存上一个版本
      if (currentVersion) {
        versions.push(currentVersion)
      }

      // 创建新版本
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        features: [],
        fixes: [],
        knownIssues: [],
      }
      currentSection = null
      continue
    }

    // 检查章节标题
    if (trimmedLine.includes('### ✨ 新特性') || trimmedLine.includes('### 🎉 首次发布') || trimmedLine.includes('### ✨ 重大更新')) {
      currentSection = 'features'
      continue
    }
    if (trimmedLine.includes('### 🐛 Bug 修复') || trimmedLine.includes('### 🐞 修复')) {
      currentSection = 'fixes'
      continue
    }
    if (trimmedLine.includes('### 📝 已知问题')) {
      currentSection = 'knownIssues'
      continue
    }

    // 解析列表项
    if (currentVersion && currentSection && trimmedLine.startsWith('-')) {
      const item = trimmedLine.substring(1).trim()
      if (item) {
        if (currentSection === 'features') {
          currentVersion.features.push(item)
        } else if (currentSection === 'fixes') {
          currentVersion.fixes.push(item)
        } else if (currentSection === 'knownIssues' && currentVersion.knownIssues) {
          currentVersion.knownIssues.push(item)
        }
      }
    }
  }

  // 保存最后一个版本
  if (currentVersion) {
    versions.push(currentVersion)
  }

  return versions
}

// 从 CHANGELOG.md 解析并只保留最近的 5 个版本
function getChangelogData(): VersionInfo[] {
  const parsed = parseChangelog()
  return parsed.slice(0, 5)
}

const CHANGELOG_DATA = getChangelogData()

// 更新日志模态框组件
function ChangelogModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* 模态框内容 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
            >
              {/* 标题栏 */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-6 py-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">更新日志</h2>
                    <p className="text-xs text-blue-100">查看最近的版本更新</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-6 space-y-4">
                {CHANGELOG_DATA.map((version, index) => (
                  <motion.div
                    key={version.version}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    {/* 版本号和日期 */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <h3 className="text-base font-bold text-white">
                            v{version.version}
                          </h3>
                        </div>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                            最新
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {version.date}
                      </div>
                    </div>

                    {/* 功能新增 */}
                    {version.features.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">功能新增</h4>
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {version.features.length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {version.features.map((feature, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + idx * 0.02 }}
                              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                            >
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bug 修复 */}
                    {version.fixes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Bug className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">问题修复</h4>
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {version.fixes.length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {version.fixes.map((fix, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + idx * 0.02 }}
                              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                            >
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{fix}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 已知问题 */}
                    {version.knownIssues && version.knownIssues.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">已知问题</h4>
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {version.knownIssues.length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {version.knownIssues.map((issue, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + idx * 0.02 }}
                              className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400 leading-relaxed"
                            >
                              <span className="text-yellow-500 mt-0.5">•</span>
                              <span>{issue}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function About() {
  const [showChangelog, setShowChangelog] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // 检测是否在 Electron 环境
  const isElectron = window.electronAPI !== undefined

  const handleCheckUpdate = async () => {
    if (!isElectron) return

    setIsChecking(true)

    try {
      // 调用 App.tsx 中挂载的全局检查更新函数
      if ((window as any).checkForUpdate) {
        await (window as any).checkForUpdate()
      }
    } catch (error) {
      console.error('检查更新失败:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const openGitHub = () => {
    // 在 Electron 环境中使用 electronAPI，否则使用 window.open
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal('https://github.com/Freakz3z/Muse')
    } else {
      window.open('https://github.com/Freakz3z/Muse', '_blank')
    }
  }
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
      >
        {/* Logo 和标题 */}
        <div className="flex items-start gap-8 mb-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="Muse Logo"
              className="w-32 h-32 rounded-2xl shadow-lg"
            />
          </div>

          {/* 信息 */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Muse</h1>
              <p className="text-gray-500">v1.6.1</p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              AI驱动的智能英语词汇学习助手，让英语学习更高效、更智能。
              通过人工智能技术，Muse 为您提供个性化的学习路径、
              智能内容生成、自适应评估和智能进度追踪。
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={openGitHub}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </button>

              <button
                onClick={() => setShowChangelog(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium"
              >
                <FileText className="w-5 h-5" />
                更新日志
              </button>

              {isElectron && (
                <button
                  onClick={handleCheckUpdate}
                  disabled={isChecking}
                  className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-500 text-white rounded-xl transition-all text-sm font-medium disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isChecking ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      检查中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      检查更新
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            © 2026 Muse. All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* 功能特性 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🧠</span>
          </div>
          <h3 className="font-bold text-gray-800 mb-1">智能学习</h3>
          <p className="text-sm text-gray-500">AI驱动的个性化学习路径</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="font-bold text-gray-800 mb-1">科学复习</h3>
          <p className="text-sm text-gray-500">基于艾宾浩斯遗忘曲线</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-bold text-gray-800 mb-1">进度追踪</h3>
          <p className="text-sm text-gray-500">可视化的学习数据分析</p>
        </div>
      </motion.div>

      {/* 更新日志模态框 */}
      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </div>
  )
}
