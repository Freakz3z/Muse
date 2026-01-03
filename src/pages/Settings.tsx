import { useState, useEffect, useCallback } from 'react'
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
  Cloud
} from 'lucide-react'
import { useAppStore } from '../store'
import { ShortcutSettings, defaultShortcuts } from '../types'
import { aiService } from '../services/ai'
import { AIConfig, AIProviderType, defaultAIConfig } from '../services/ai/types'
import { getShortcutDisplay } from '../hooks/useShortcuts'

export default function Settings() {
  const { settings, updateSettings, profile, updateProfile, createProfile } = useAppStore()
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [saved, setSaved] = useState(false)
  
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
    rateEasy: '太简单',
    rateGood: '记住了',
    rateHard: '有点难',
    rateAgain: '忘记了',
  }
  
  // AI 配置状态
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const savedConfig = localStorage.getItem('ai_config')
    return savedConfig ? JSON.parse(savedConfig) : defaultAIConfig
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [aiSaved, setAiSaved] = useState(false)

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
    const code = e.code

    // 忽略修饰键单独按下
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return

    // 确保 shortcuts 存在，使用默认值作为后备
    const currentShortcuts = settings.shortcuts || defaultShortcuts

    // 检查快捷键冲突
    const conflictKey = Object.entries(currentShortcuts).find(
      ([key, value]) => key !== editingShortcut && value === code
    )

    if (conflictKey) {
      const conflictLabel = shortcutLabels[conflictKey[0]] || conflictKey[0]
      setShortcutConflict(conflictLabel)
      // 3秒后自动清除冲突提示
      setTimeout(() => setShortcutConflict(null), 3000)
      return
    }

    // 更新快捷键
    const newShortcuts = { ...currentShortcuts, [editingShortcut]: code }
    updateSettings({ shortcuts: newShortcuts })
    setEditingShortcut(null)
    setShortcutConflict(null)
  }, [editingShortcut, settings.shortcuts, updateSettings, shortcutLabels])
  
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

  const handleSaveProfile = async () => {
    if (!profile) {
      await createProfile({
        nickname: nickname || '学习者',
        level: 'A2',
        goal: 'daily',
        interests: [],
        streak: 0,
        totalWords: 0,
        lastStudyAt: Date.now(),
      })
    } else {
      await updateProfile({ nickname })
    }
    
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">设置</h1>

      {/* 用户信息 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-400" />
          个人信息
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? '已保存' : '保存'}
          </button>
        </div>
      </div>

      {/* 学习设置 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-gray-400" />
          学习设置
        </h2>

        <div className="space-y-6">
          {/* 每日目标和快速复习数量 - 现代卡片式设计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 每日学习目标 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-semibold">每日学习目标</h3>
                  <p className="text-gray-500 text-sm mt-1">每天新学单词的数量</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">📚</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => updateSettings({ dailyGoal: Math.max(5, settings.dailyGoal - 5) })}
                  className="w-10 h-10 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center"
                >
                  <span className="text-lg font-semibold">−</span>
                </button>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{settings.dailyGoal}</div>
                  <div className="text-xs text-gray-500 mt-1">个/天</div>
                </div>

                <button
                  onClick={() => updateSettings({ dailyGoal: Math.min(100, settings.dailyGoal + 5) })}
                  className="w-10 h-10 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center"
                >
                  <span className="text-lg font-semibold">+</span>
                </button>
              </div>

              {/* 预设选项 */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {[10, 20, 30, 50].map((value) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ dailyGoal: value })}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      settings.dailyGoal === value
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* 快速复习数量 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 font-semibold">快速复习数量</h3>
                  <p className="text-gray-500 text-sm mt-1">每次快速复习的单词数</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <span className="text-violet-600 font-bold text-lg">⚡</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => updateSettings({ quickReviewLimit: Math.max(10, (settings.quickReviewLimit || 30) - 10) })}
                  className="w-10 h-10 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-all flex items-center justify-center"
                >
                  <span className="text-lg font-semibold">−</span>
                </button>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{settings.quickReviewLimit || 30}</div>
                  <div className="text-xs text-gray-500 mt-1">个/次</div>
                </div>

                <button
                  onClick={() => updateSettings({ quickReviewLimit: Math.min(100, (settings.quickReviewLimit || 30) + 10) })}
                  className="w-10 h-10 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-600 transition-all flex items-center justify-center"
                >
                  <span className="text-lg font-semibold">+</span>
                </button>
              </div>

              {/* 预设选项 */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {[20, 30, 50, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ quickReviewLimit: value })}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      settings.quickReviewLimit === value
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 自动播放 */}
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

          {/* AI 自动分析 */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-gray-700">AI 智能分析</p>
                <p className="text-gray-400 text-sm">学习时自动显示 AI 深度分析</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ enableAIAnalysis: !settings.enableAIAnalysis })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enableAIAnalysis ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: settings.enableAIAnalysis ? 24 : 2 }}
                className="w-5 h-5 bg-white rounded-full shadow"
              />
            </button>
          </div>
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
                  </div>
                </div>
                
                {/* 复习界面快捷键 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">复习评分</h3>
                  <div className="space-y-1">
                    <ShortcutItem
                      label="太简单"
                      currentValue={settings.shortcuts?.rateEasy || defaultShortcuts.rateEasy}
                      isEditing={editingShortcut === 'rateEasy'}
                      onEdit={() => setEditingShortcut('rateEasy')}
                      onCancel={() => setEditingShortcut(null)}
                    />
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

                {aiConfig.enabled && (
                  <>
                    {/* 协议类型选择 */}
                    <div>
                      <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">API 协议类型</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'openai', name: 'OpenAI', desc: '标准 API 协议', icon: <SettingsIcon className="w-4 h-4" /> },
                          { id: 'ollama', name: 'Ollama', desc: '本地推理协议', icon: <Cpu className="w-4 h-4" /> },
                          { id: 'anthropic', name: 'Claude', desc: 'Anthropic 协议', icon: <Cloud className="w-4 h-4" /> },
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
                  💡 提示：配置完成后点击“测试并保存”以验证 API 是否可用。
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
