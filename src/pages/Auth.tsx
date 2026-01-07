/**
 * 登录/注册页面
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logo from '/Muse.png'
import { authService } from '../services/auth/AuthService'

export default function Auth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.username) {
      setError('请输入用户名')
      return false
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('用户名长度应为3-20位')
      return false
    }

    if (!isLogin && !formData.email) {
      setError('请输入邮箱')
      return false
    }

    if (!formData.password) {
      setError('请输入密码')
      return false
    }

    if (formData.password.length < 8) {
      setError('密码至少8位')
      return false
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致')
      return false
    }

    if (!isLogin && !formData.nickname) {
      setError('请输入昵称')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setLoading(true)

    try {
      if (isLogin) {
        // 登录
        const result = await authService.login({
          username: formData.username,
          password: formData.password,
        })

        if (result.success) {
          navigate('/')
        } else {
          setError(result.error || '登录失败')
        }
      } else {
        // 注册
        const result = await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
        })

        if (result.success) {
          navigate('/')
        } else {
          setError(result.error || '注册失败')
        }
      }
    } catch (err) {
      setError('操作失败,请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Muse"
            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-2xl"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Muse</h1>
          <p className="text-white/80">汇聚知识的宇宙</p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isLogin ? '登录' : '注册'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="block text-gray-600 text-sm mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="3-20位字母、数字或下划线"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 邮箱(仅注册) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-600 text-sm mb-2">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* 密码 */}
            <div>
              <label className="block text-gray-600 text-sm mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="至少8位,包含字母和数字"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 确认密码(仅注册) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-600 text-sm mb-2">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="再次输入密码"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* 昵称(仅注册) */}
            {!isLogin && (
              <div>
                <label className="block text-gray-600 text-sm mb-2">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="如何称呼你?"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>处理中...</>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  登录
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  注册
                </>
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              {isLogin ? '还没有账号? 立即注册' : '已有账号? 立即登录'}
            </button>
          </div>
        </div>

        {/* 跳过按钮 */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white text-sm flex items-center gap-2 mx-auto"
          >
            跳过,先体验一下
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
