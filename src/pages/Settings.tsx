import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Target, 
  Volume2, 
  Bell, 
  Clock,
  Save,
  Bot,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Keyboard,
  RotateCcw
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
  
  // 快捷键编辑状态
  const [editingShortcut, setEditingShortcut] = useState<keyof ShortcutSettings | null>(null)
  
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
    
    // 更新快捷键
    const newShortcuts = { ...settings.shortcuts, [editingShortcut]: code }
    updateSettings({ shortcuts: newShortcuts })
    setEditingShortcut(null)
  }, [editingShortcut, settings.shortcuts, updateSettings])
  
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
          {/* 每日目标 */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">每日学习目标</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={settings.dailyGoal}
                onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="w-16 text-center font-medium text-blue-500">
                {settings.dailyGoal} 个
              </span>
            </div>
          </div>

          {/* 自动播放 */}
          <div className="flex items-center justify-between">
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
      </div>

      {/* 提醒设置 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-400" />
          提醒设置
        </h2>
        
        <div className="space-y-6">
          {/* 学习提醒开关 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">学习提醒</p>
              <p className="text-gray-400 text-sm">每天定时提醒你学习</p>
            </div>
            <button
              onClick={() => updateSettings({ notifications: !settings.notifications })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: settings.notifications ? 24 : 2 }}
                className="w-5 h-5 bg-white rounded-full shadow"
              />
            </button>
          </div>

          {/* 提醒时间 */}
          {settings.notifications && (
            <div>
              <label className="block text-gray-600 text-sm mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                提醒时间
              </label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 快捷键设置 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-gray-400" />
            快捷键设置
          </h2>
          <button
            onClick={resetShortcuts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            恢复默认
          </button>
        </div>
        
        <div className="space-y-6">
          {/* 学习界面快捷键 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">学习界面</h3>
            <div className="space-y-2">
              <ShortcutItem
                label="显示答案"
                currentValue={settings.shortcuts?.showAnswer || defaultShortcuts.showAnswer}
                isEditing={editingShortcut === 'showAnswer'}
                onEdit={() => setEditingShortcut('showAnswer')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="上一个单词"
                currentValue={settings.shortcuts?.prevWord || defaultShortcuts.prevWord}
                isEditing={editingShortcut === 'prevWord'}
                onEdit={() => setEditingShortcut('prevWord')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="下一个单词"
                currentValue={settings.shortcuts?.nextWord || defaultShortcuts.nextWord}
                isEditing={editingShortcut === 'nextWord'}
                onEdit={() => setEditingShortcut('nextWord')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="认识"
                currentValue={settings.shortcuts?.markKnown || defaultShortcuts.markKnown}
                isEditing={editingShortcut === 'markKnown'}
                onEdit={() => setEditingShortcut('markKnown')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="不认识"
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
            </div>
          </div>
          
          {/* 复习界面快捷键 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">复习评分</h3>
            <div className="space-y-2">
              <ShortcutItem
                label="简单"
                currentValue={settings.shortcuts?.rateEasy || defaultShortcuts.rateEasy}
                isEditing={editingShortcut === 'rateEasy'}
                onEdit={() => setEditingShortcut('rateEasy')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="一般"
                currentValue={settings.shortcuts?.rateGood || defaultShortcuts.rateGood}
                isEditing={editingShortcut === 'rateGood'}
                onEdit={() => setEditingShortcut('rateGood')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="困难"
                currentValue={settings.shortcuts?.rateHard || defaultShortcuts.rateHard}
                isEditing={editingShortcut === 'rateHard'}
                onEdit={() => setEditingShortcut('rateHard')}
                onCancel={() => setEditingShortcut(null)}
              />
              <ShortcutItem
                label="重来"
                currentValue={settings.shortcuts?.rateAgain || defaultShortcuts.rateAgain}
                isEditing={editingShortcut === 'rateAgain'}
                onEdit={() => setEditingShortcut('rateAgain')}
                onCancel={() => setEditingShortcut(null)}
              />
            </div>
          </div>
          
          {/* 快捷键提示 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 提示：点击快捷键按钮后，按下新的按键即可修改。支持字母、数字和功能键。
            </p>
          </div>
        </div>
      </div>

      {/* AI 设置 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-gray-400" />
          AI 智能服务
        </h2>
        
        <div className="space-y-6">
          {/* 启用开关 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">启用 AI 功能</p>
              <p className="text-gray-400 text-sm">智能释义、记忆技巧、翻译等</p>
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
              {/* AI 提供商选择 */}
              <div>
                <label className="block text-gray-600 text-sm mb-2">AI 服务提供商</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'openai', name: 'OpenAI', desc: 'GPT 系列' },
                    { id: 'ollama', name: 'Ollama', desc: '本地部署' },
                    { id: 'deepseek', name: 'DeepSeek', desc: '深度求索' },
                    { id: 'zhipu', name: '智谱 AI', desc: 'GLM 系列' },
                  ].map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => updateAIConfig({ provider: provider.id as AIProviderType })}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        aiConfig.provider === provider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{provider.name}</p>
                      <p className="text-xs text-gray-500">{provider.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* API 配置 */}
              <div className="space-y-4">
                {/* API Key */}
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    API Key {aiConfig.provider !== 'ollama' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={aiConfig.apiKey}
                      onChange={(e) => updateAIConfig({ apiKey: e.target.value })}
                      placeholder={aiConfig.provider === 'ollama' ? '本地模式无需 API Key' : '输入你的 API Key'}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  <label className="block text-gray-600 text-sm mb-2">API 地址（可选）</label>
                  <input
                    type="text"
                    value={aiConfig.baseUrl}
                    onChange={(e) => updateAIConfig({ baseUrl: e.target.value })}
                    placeholder={
                      aiConfig.provider === 'openai' ? 'https://api.openai.com/v1' :
                      aiConfig.provider === 'ollama' ? 'http://localhost:11434' :
                      aiConfig.provider === 'deepseek' ? 'https://api.deepseek.com' :
                      'https://open.bigmodel.cn/api/paas/v4'
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* 模型名称 */}
                <div>
                  <label className="block text-gray-600 text-sm mb-2">模型名称</label>
                  <input
                    type="text"
                    value={aiConfig.model}
                    onChange={(e) => updateAIConfig({ model: e.target.value })}
                    placeholder={
                      aiConfig.provider === 'openai' ? 'gpt-4o-mini' :
                      aiConfig.provider === 'ollama' ? 'llama3' :
                      aiConfig.provider === 'deepseek' ? 'deepseek-chat' :
                      'glm-4-flash'
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection || (!aiConfig.apiKey && aiConfig.provider !== 'ollama')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingConnection ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : connectionStatus === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : connectionStatus === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : null}
                  {testingConnection ? '测试中...' : 
                   connectionStatus === 'success' ? '连接成功，已保存' :
                   connectionStatus === 'error' ? '连接失败' : '测试并保存'}
                </button>
                <button
                  onClick={handleSaveAIConfig}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {aiSaved ? '已保存' : '仅保存'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💡 点击"测试并保存"会使用当前配置测试连接，成功后自动保存
              </p>
            </>
          )}
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">关于</h2>
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="Muse.png" 
              alt="Muse Logo" 
              className="w-24 h-24 rounded-2xl shadow-md"
            />
          </div>
          
          {/* 信息 */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Muse</h3>
              <p className="text-sm text-gray-500">v1.4.2</p>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              AI驱动的智能英语词汇学习助手，让英语学习更高效、更智能。
              通过人工智能技术，Muse 为您提供个性化的学习路径、
              智能内容生成、自适应评估和智能进度追踪。
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/Freakz3z/Muse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
              
              <p className="text-xs text-gray-400">
                © 2026 Muse. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
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
}

function ShortcutItem({ label, currentValue, isEditing, onEdit, onCancel }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
      <span className="text-gray-700">{label}</span>
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
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors min-w-[60px]"
        >
          {getShortcutDisplay(currentValue)}
        </button>
      )}
    </div>
  )
}
