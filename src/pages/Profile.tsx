/**
 * 个人资料页面
 * 展示和编辑用户个人信息
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Calendar,
  BookOpen,
  Trophy,
  Target,
  Edit2,
  Check,
  X,
  LogOut,
  Flame,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store'
import { authService } from '../services/auth/AuthService'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, updateProfile, todayStats, records } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setNickname(profile?.nickname || '')
  }, [profile])

  const handleSave = async () => {
    if (nickname.trim()) {
      await updateProfile({ nickname: nickname.trim() })
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleCancel = () => {
    setNickname(profile?.nickname || '')
    setIsEditing(false)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/auth/login')
  }

  const totalMastered = Array.from(records.values()).filter(r => r.masteryLevel >= 3).length
  const joinDate = profile?.lastStudyAt ? new Date(profile.lastStudyAt) : new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👤 个人资料
        </h1>
        <p className="text-gray-600">
          管理你的个人信息和学习偏好
        </p>
      </motion.div>

      {/* 用户信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* 头像 */}
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-12 h-12" />
            </div>

            {/* 用户信息 */}
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1 backdrop-blur-sm border-2 border-white/30 focus:border-white focus:outline-none"
                    placeholder="输入昵称"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{profile?.nickname || '学习者'}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {saved && (
                    <span className="text-sm bg-green-500/30 px-2 py-1 rounded">已保存</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-2 text-white/80">
                {profile?.level && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">{profile.level}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {joinDate.toLocaleDateString('zh-CN')} 加入
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 登出按钮 */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </motion.div>

      {/* 学习统计 */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Flame className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">连续学习</p>
              <p className="text-2xl font-bold text-gray-800">{profile?.streak || 0} 天</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">已学单词</p>
              <p className="text-2xl font-bold text-gray-800">{profile?.totalWords || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">已掌握</p>
              <p className="text-2xl font-bold text-gray-800">{totalMastered}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Target className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">今日学习</p>
              <p className="text-2xl font-bold text-gray-800">
                {todayStats.newWords + todayStats.reviewedWords}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 详细信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">详细信息</h3>

        <div className="space-y-4">
          {/* 用户名 */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">用户名</span>
            </div>
            <span className="text-gray-800 font-medium">{profile?.nickname || '本地用户'}</span>
          </div>

          {/* 学习目标 */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">学习目标</span>
            </div>
            <span className="text-gray-800 font-medium">
              {profile?.goal === 'daily' ? '每日坚持' : profile?.goal === 'exam' ? '考试冲刺' : '职业提升'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
