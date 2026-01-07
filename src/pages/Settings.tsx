import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Target,
  Volume2,
  Save,
  Bot,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Keyboard,
  RotateCcw,
  ChevronRight,
  X,
  Settings as SettingsIcon,
  Cpu,
  Sparkles,
  TestTube,
} from 'lucide-react'
import { useAppStore } from '../store'
import { ShortcutSettings, defaultShortcuts } from '../types'
import { aiService } from '../services/ai'
import { AIConfig, AIProviderType, defaultAIConfig } from '../services/ai/types'
import { getShortcutDisplay } from '../hooks/useShortcuts'
import { updateAdaptiveConfig } from '../utils/spaced-repetition'

export default function Settings() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useAppStore()
  
  // 弹窗状态
  const [showShortcutModal, setShowShortcutModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  
  // 快捷键编辑状态
  const [editingShortcut, setEditingShortcut] = useState<keyof ShortcutSettings | null>(null)
  const [shortcutConflict, setShortcutConflict] = useState<string | null>(null)

  // 快捷键功能标签映射
  const shortcutLabels: Record<string, string> = {
    showAnswer: '显示答案 / 返回当前学习',
    markKnown: '认识 / 下一个',
    markUnknown: '不认识 / 上一个',
    playAudio: '播放发音',
    showAIAnalysis: 'AI 智能分析',
    showPersonalizedAI: '个性化 AI 内容',
    nextQuestion: '下一题',
    rateGood: '记住了',
    rateHard: '有点难',
    rateAgain: '忘记了',
    toggleFloating: '切换悬浮窗',
  }

  // 快捷键界面分组
  const shortcutGroups: Record<string, string[]> = {
    learning: ['showAnswer', 'markKnown', 'markUnknown', 'playAudio', 'showAIAnalysis', 'showPersonalizedAI'],
    quiz: ['nextQuestion'],
    review: ['rateGood', 'rateHard', 'rateAgain'],
    global: ['toggleFloating'],
  }

  // 监听快捷键变化，更新 Electron 全局快捷键（仅在 Electron 环境中）
  useEffect(() => {
    if (window.electronAPI && settings.shortcuts?.toggleFloating) {
      // 将快捷键字符串转换为 Electron 加速器格式
      // 例如：Alt+KeyX -> Alt+X, Control+Shift+KeyD -> Ctrl+Shift+D
      const shortcut = settings.shortcuts.toggleFloating
        .replace('Control', 'Ctrl')
        .replace(/Key([A-Z])/, '$1')
        .replace('Digit', '')

      window.electronAPI.updateFloatingShortcut(shortcut)
    }
  }, [settings.shortcuts?.toggleFloating])

  // AI 配置状态
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const savedConfig = localStorage.getItem('ai_config')
    return savedConfig ? JSON.parse(savedConfig) : defaultAIConfig
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [aiSaved, setAiSaved] = useState(false)

  // AI 自适应引擎开关状态
  const [adaptiveEngineEnabled, setAdaptiveEngineEnabled] = useState(() => {
    const saved = localStorage.getItem('adaptive_engine_enabled')
    return saved ? JSON.parse(saved) : false
  })

  // 保存 AI 配置
  const handleSaveAIConfig = () => {
    localStorage.setItem('ai_config', JSON.stringify(aiConfig))
    aiService.updateConfig(aiConfig)
    setAiSaved(true)
    setTimeout(() => setAiSaved(false), 2000)
  }

  // 测试连接 - 使用当前表单配置进行测试（无需先保存）
  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus('idle')
    
    try {
      // 临时应用当前配置进行测试
      aiService.updateConfig(aiConfig)
      const success = await aiService.testConnection()
      setConnectionStatus(success ? 'success' : 'error')
      
      // 测试成功后自动保存配置
      if (success) {
        localStorage.setItem('ai_config', JSON.stringify(aiConfig))
        setAiSaved(true)
        setTimeout(() => setAiSaved(false), 2000)
      }
    } catch (error) {
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  // 更新 AI 配置
  const updateAIConfig = (updates: Partial<AIConfig>) => {
    setAiConfig(prev => ({ ...prev, ...updates }))
    setConnectionStatus('idle')
  }

  // 快捷键编辑处理
  const handleShortcutKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editingShortcut) return

    e.preventDefault()

    // 忽略修饰键单独按下
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return

    // 构建快捷键字符串（支持组合键）
    const modifiers: string[] = []
    if (e.altKey) modifiers.push('Alt')
    if (e.ctrlKey) modifiers.push('Control')
    if (e.shiftKey) modifiers.push('Shift')
    if (e.metaKey) modifiers.push('Meta')

    const shortcutString = modifiers.length > 0
      ? `${modifiers.join('+')}+${e.code}`
      : e.code

    // 确保 shortcuts 存在，使用默认值作为后备
    const currentShortcuts = settings.shortcuts || defaultShortcuts

    // 找到当前快捷键所属的界面分组
    const currentGroup = Object.values(shortcutGroups).find(
      shortcuts => shortcuts.includes(editingShortcut)
    ) || []

    // 检查快捷键冲突（只在同一界面内检查）
    const conflictKey = currentGroup.find(
      key => key !== editingShortcut && currentShortcuts[key as keyof ShortcutSettings] === shortcutString
    )

    if (conflictKey) {
      const conflictLabel = shortcutLabels[conflictKey] || conflictKey
      setShortcutConflict(conflictLabel)
      // 3秒后自动清除冲突提示
      setTimeout(() => setShortcutConflict(null), 3000)
      return
    }

    // 更新快捷键
    const newShortcuts = { ...currentShortcuts, [editingShortcut]: shortcutString }
    updateSettings({ shortcuts: newShortcuts })
    setEditingShortcut(null)
    setShortcutConflict(null)
  }, [editingShortcut, settings.shortcuts, updateSettings, shortcutLabels, shortcutGroups])
  
  useEffect(() => {
    if (editingShortcut) {
      window.addEventListener('keydown', handleShortcutKeyDown)
      return () => window.removeEventListener('keydown', handleShortcutKeyDown)
    }
  }, [editingShortcut, handleShortcutKeyDown])
  
  // 重置快捷键
  const resetShortcuts = () => {
    updateSettings({ shortcuts: defaultShortcuts })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">设置</h1>

      {/* 个人资料入口 */}
      <Link to="/profile" className="block">
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all card-hover group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">个人资料</h3>
                <p className="text-gray-500 text-sm">查看和编辑你的个人信息</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </Link>

      {/* 学习设置提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-2">学习设置已迁移</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              每日学习目标和快速复习数量的设置已移至
              <Link to="/learning" className="text-blue-600 hover:text-blue-700 font-medium mx-1">学习中心</Link>
              ，以便您在学习时快速调整。
            </p>
          </div>
        </div>
      </div>

      {/* 自动播放设置 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-gray-400" />
          播放设置
        </h2>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">自动播放发音</p>
              <p className="text-gray-400 text-sm">学习时自动播放单词发音</p>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ autoPlay: !settings.autoPlay })}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.autoPlay ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <motion.div
              animate={{ x: settings.autoPlay ? 24 : 2 }}
              className="w-5 h-5 bg-white rounded-full shadow"
            />
          </button>
        </div>
      </div>

      {/* 高级设置入口 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setShowShortcutModal(true)}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Keyboard className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">快捷键设置</p>
              <p className="text-xs text-gray-500">自定义操作快捷键</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </button>

        <button
          onClick={() => setShowAIModal(true)}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">AI 智能服务</p>
              <p className="text-xs text-gray-500">配置 AI 引擎与 API</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </button>
      </div>

      {/* 快捷键设置弹窗 */}
      <AnimatePresence>
        {showShortcutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-bold text-gray-800">快捷键设置</h2>
                </div>
                <button onClick={() => setShowShortcutModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={resetShortcuts}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    恢复默认
                  </button>
                </div>

                {/* 学习界面快捷键 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">学习界面</h3>
                  <div className="space-y-1">
                    <ShortcutItem
                      label="显示答案 / 返回当前学习"
                      currentValue={settings.shortcuts?.showAnswer || defaultShortcuts.showAnswer}
                      isEditing={editingShortcut === 'showAnswer'}
                      onEdit={() => setEditingShortcut('showAnswer')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="认识 / 下一个"
                      currentValue={settings.shortcuts?.markKnown || defaultShortcuts.markKnown}
                      isEditing={editingShortcut === 'markKnown'}
                      onEdit={() => setEditingShortcut('markKnown')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="不认识 / 上一个"
                      currentValue={settings.shortcuts?.markUnknown || defaultShortcuts.markUnknown}
                      isEditing={editingShortcut === 'markUnknown'}
                      onEdit={() => setEditingShortcut('markUnknown')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="播放发音"
                      currentValue={settings.shortcuts?.playAudio || defaultShortcuts.playAudio}
                      isEditing={editingShortcut === 'playAudio'}
                      onEdit={() => setEditingShortcut('playAudio')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="AI 智能分析"
                      currentValue={settings.shortcuts?.showAIAnalysis || defaultShortcuts.showAIAnalysis}
                      isEditing={editingShortcut === 'showAIAnalysis'}
                      onEdit={() => setEditingShortcut('showAIAnalysis')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="个性化 AI 内容"
                      currentValue={settings.shortcuts?.showPersonalizedAI || defaultShortcuts.showPersonalizedAI}
                      isEditing={editingShortcut === 'showPersonalizedAI'}
                      onEdit={() => setEditingShortcut('showPersonalizedAI')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                  </div>
                </div>

                {/* 测验界面快捷键 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">测验界面</h3>
                  <div className="space-y-1">
                    <ShortcutItem
                      label="下一题"
                      currentValue={settings.shortcuts?.nextQuestion || defaultShortcuts.nextQuestion}
                      isEditing={editingShortcut === 'nextQuestion'}
                      onEdit={() => setEditingShortcut('nextQuestion')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                  </div>
                </div>

                {/* 复习界面快捷键 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">复习评分</h3>
                  <div className="space-y-1">
                    <ShortcutItem
                      label="记住了"
                      currentValue={settings.shortcuts?.rateGood || defaultShortcuts.rateGood}
                      isEditing={editingShortcut === 'rateGood'}
                      onEdit={() => setEditingShortcut('rateGood')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="有点难"
                      currentValue={settings.shortcuts?.rateHard || defaultShortcuts.rateHard}
                      isEditing={editingShortcut === 'rateHard'}
                      onEdit={() => setEditingShortcut('rateHard')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                    <ShortcutItem
                      label="忘记了"
                      currentValue={settings.shortcuts?.rateAgain || defaultShortcuts.rateAgain}
                      isEditing={editingShortcut === 'rateAgain'}
                      onEdit={() => setEditingShortcut('rateAgain')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                  </div>
                </div>

                {/* 全局快捷键 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">全局快捷键</h3>
                  <div className="space-y-1">
                    <ShortcutItem
                      label="切换悬浮窗"
                      currentValue={settings.shortcuts?.toggleFloating || defaultShortcuts.toggleFloating}
                      isEditing={editingShortcut === 'toggleFloating'}
                      onEdit={() => setEditingShortcut('toggleFloating')}
                      onCancel={() => setEditingShortcut(null)}
                    />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-purple-700">
                    💡 提示：点击快捷键按钮后，按下键盘上的任意按键即可完成修改。
                  </p>
                </div>

                {/* 冲突警告 */}
                {shortcutConflict && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 rounded-xl p-4 border border-red-200"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-red-700">快捷键冲突</p>
                        <p className="text-xs text-red-600 mt-1">
                          该按键已被"{shortcutConflict}"使用，请选择其他按键。
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowShortcutModal(false)}
                  className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                >
                  完成
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI 设置弹窗 */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-800">AI 智能服务配置</h2>
                </div>
                <button onClick={() => setShowAIModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                {/* 启用开关 */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <p className="font-bold text-blue-900">启用 AI 功能</p>
                    <p className="text-blue-700/70 text-xs">智能释义、记忆技巧、翻译等</p>
                  </div>
                  <button
                    onClick={() => updateAIConfig({ enabled: !aiConfig.enabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      aiConfig.enabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: aiConfig.enabled ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                {/* AI 自适应学习引擎 */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-purple-900">AI 自适应学习引擎</p>
                      {adaptiveEngineEnabled && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-medium">已启用</span>
                      )}
                    </div>
                    <p className="text-purple-700/70 text-xs mt-1">
                      基于AI分析学习行为，个性化预测最佳复习时间
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newState = !adaptiveEngineEnabled;
                      setAdaptiveEngineEnabled(newState);
                      // 保存到localStorage
                      localStorage.setItem('adaptive_engine_enabled', JSON.stringify(newState));
                      // 更新自适应引擎配置
                      updateAdaptiveConfig({ enableAI: newState });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      adaptiveEngineEnabled ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: adaptiveEngineEnabled ? 24 : 2 }}
                      className="w-5 h-5 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                {/* AI 自适应引擎说明 */}
                {adaptiveEngineEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100"
                  >
                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      AI 自适应引擎特性
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span><strong>个性化遗忘曲线</strong>：根据您的记忆模式定制复习间隔</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span><strong>学习时段优化</strong>：考虑您的最佳学习时间和状态</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span><strong>情感状态感知</strong>：根据信心水平和动机调整难度</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span><strong>智能难度评估</strong>：动态评估单词难度并提供个性化建议</span>
                      </li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-purple-200 space-y-2">
                      <p className="text-[10px] text-gray-500">
                        💡 系统会自动收集学习数据并持续优化预测准确性。如AI预测失败，将自动回退到传统SM-2算法。
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => navigate('/test-adaptive')}
                          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <TestTube className="w-3.5 h-3.5" />
                          测试AI引擎效果
                        </button>
                        <button
                          onClick={() => navigate('/test-content')}
                          className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          测试内容生成
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiConfig.enabled && (
                  <>
                    {/* 协议类型选择 */}
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">API 协议类型</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'openai', name: 'OpenAI', desc: '标准 API 协议', icon: <SettingsIcon className="w-4 h-4" /> },
                          { id: 'ollama', name: 'Ollama', desc: '本地推理协议', icon: <Cpu className="w-4 h-4" /> },
                          { id: 'anthropic', name: 'Claude', desc: 'Anthropic 协议', icon: <Sparkles className="w-4 h-4" /> },
                          { id: 'gemini', name: 'Gemini', desc: 'Google AI 协议', icon: <Sparkles className="w-4 h-4" /> },
                        ].map(provider => (
                          <button
                            key={provider.id}
                            onClick={() => updateAIConfig({ provider: provider.id as AIProviderType })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              aiConfig.provider === provider.id
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={aiConfig.provider === provider.id ? 'text-blue-500' : 'text-gray-400'}>
                                {provider.icon}
                              </span>
                              <p className="font-bold text-gray-800 text-sm">{provider.name}</p>
                            </div>
                            <p className="text-[10px] text-gray-400">{provider.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* API 配置 */}
                    <div className="space-y-4">
                      {/* API Key */}
                      <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">
                          API Key {aiConfig.provider !== 'ollama' && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={aiConfig.apiKey}
                            onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
                            placeholder={aiConfig.provider === 'ollama' ? '本地模式无需 API Key' : '输入你的 API Key'}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* API 地址 */}
                      <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">API 代理地址 (Base URL)</label>
                        <input
                          type="text"
                          value={aiConfig.baseUrl}
                          onChange={(e) => updateAIConfig({ baseUrl: e.target.value })}
                          placeholder={
                            aiConfig.provider === 'openai' ? 'https://api.openai.com/v1' :
                            aiConfig.provider === 'ollama' ? 'http://localhost:11434' :
                            aiConfig.provider === 'anthropic' ? 'https://api.anthropic.com/v1' :
                            'https://generativelanguage.googleapis.com/v1beta'
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                        />
                      </div>

                      {/* 模型名称 */}
                      <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">模型名称 (Model)</label>
                        <input
                          type="text"
                          value={aiConfig.model}
                          onChange={(e) => updateAIConfig({ model: e.target.value })}
                          placeholder={
                            aiConfig.provider === 'openai' ? 'gpt-4o-mini' :
                            aiConfig.provider === 'ollama' ? 'llama3' :
                            aiConfig.provider === 'anthropic' ? 'claude-3-5-sonnet-20240620' :
                            'gemini-1.5-flash'
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6 border-t bg-gray-50 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection || (!aiConfig.apiKey && aiConfig.provider !== 'ollama')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingConnection ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : connectionStatus === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : connectionStatus === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : null}
                    {testingConnection ? '测试中...' : '测试并保存'}
                  </button>
                  <button
                    onClick={handleSaveAIConfig}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {aiSaved ? '已保存' : '仅保存'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  💡 提示：配置完成后点击"测试并保存"以验证 API 是否可用。
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 快捷键设置项组件
interface ShortcutItemProps {
  label: string
  currentValue: string
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  hasConflict?: boolean
}

function ShortcutItem({ label, currentValue, isEditing, onEdit, onCancel, hasConflict }: ShortcutItemProps) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${hasConflict ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
      <div className="flex-1">
        <span className={`text-gray-700 ${hasConflict ? 'text-red-700' : ''}`}>{label}</span>
        {hasConflict && (
          <p className="text-xs text-red-500 mt-1">快捷键冲突</p>
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium animate-pulse">
            按下新按键...
          </span>
          <button
            onClick={onCancel}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[60px] ${
            hasConflict
              ? 'bg-red-100 hover:bg-red-200 text-red-700'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {getShortcutDisplay(currentValue)}
        </button>
      )}
    </div>
  )
}
