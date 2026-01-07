/**
 * 用户认证服务
 * 使用本地存储模式
 */

import { User, LoginCredentials, RegisterData } from '../../types/user'

class AuthService {
  private currentUser: User | null = null

  /**
   * 初始化认证服务
   */
  async initialize() {
    // 从本地存储恢复用户会话
    const savedUser = localStorage.getItem('muse_user')
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser)
      } catch (error) {
        console.error('恢复用户会话失败:', error)
        this.logout()
      }
    }
  }

  /**
   * 用户注册
   */
  async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      // 验证用户名格式
      if (!this.validateUsername(data.username)) {
        return { success: false, error: '用户名只能包含字母、数字、下划线,长度3-20位' }
      }

      // 验证密码强度
      if (!this.validatePassword(data.password)) {
        return { success: false, error: '密码至少8位,包含字母和数字' }
      }

      // 检查用户名是否已存在
      const exists = await this.checkUserExists(data.username)
      if (exists) {
        return { success: false, error: '用户名已存在' }
      }

      // 创建用户
      const user: User = {
        id: this.generateUserId(data.username),
        username: data.username,
        email: data.email,
        nickname: data.nickname || data.username,
        level: 'A2',
        goal: 'daily',
        interests: [],
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      }

      // 保存到本地
      this.saveUserToLocal(user, data.password)

      this.currentUser = user
      this.saveSession()

      return { success: true }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, error: '注册失败,请稍后重试' }
    }
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.loginLocal(credentials.username, credentials.password)

      if (user) {
        this.currentUser = user
        this.saveSession()
        return { success: true }
      }

      return { success: false, error: '用户名或密码错误' }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: '登录失败,请稍后重试' }
    }
  }

  /**
   * 用户登出
   */
  logout() {
    this.currentUser = null
    localStorage.removeItem('muse_user')
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * 更新用户信息
   */
  async updateProfile(updates: Partial<User>): Promise<boolean> {
    if (!this.currentUser) return false

    try {
      const updatedUser = { ...this.currentUser, ...updates }
      this.currentUser = updatedUser

      // 更新本地存储
      localStorage.setItem(`user_${updatedUser.username}`, JSON.stringify(updatedUser))
      this.saveSession()

      return true
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return false
    }
  }

  /**
   * 验证用户名格式
   */
  private validateUsername(username: string): boolean {
    const regex = /^[a-zA-Z0-9_]{3,20}$/
    return regex.test(username)
  }

  /**
   * 验证密码强度
   */
  private validatePassword(password: string): boolean {
    // 至少8位,包含字母和数字
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
    return regex.test(password)
  }

  /**
   * 生成用户ID
   */
  private generateUserId(username: string): string {
    return `user_${username}_${Date.now()}`
  }

  /**
   * 检查用户名是否存在
   */
  private async checkUserExists(username: string): Promise<boolean> {
    const localUser = localStorage.getItem(`user_${username}`)
    return !!localUser
  }

  /**
   * 保存用户到本地
   */
  private saveUserToLocal(user: User, password: string): void {
    const userData = {
      ...user,
      passwordHash: btoa(password), // Base64编码仅作为示例,生产环境应使用bcrypt
    }
    localStorage.setItem(`user_${user.username}`, JSON.stringify(userData))
  }

  /**
   * 本地登录
   */
  private async loginLocal(username: string, password: string): Promise<User | null> {
    const userData = localStorage.getItem(`user_${username}`)
    if (!userData) return null

    try {
      const user = JSON.parse(userData)
      const inputPasswordHash = btoa(password)

      if (user.passwordHash !== inputPasswordHash) {
        return null
      }

      // 更新最后登录时间
      user.lastLoginAt = Date.now()
      localStorage.setItem(`user_${username}`, JSON.stringify(user))

      // 返回不包含密码的用户信息
      const { passwordHash: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    } catch (error) {
      console.error('本地登录失败:', error)
      return null
    }
  }

  /**
   * 保存会话
   */
  private saveSession(): void {
    if (this.currentUser) {
      localStorage.setItem('muse_user', JSON.stringify(this.currentUser))
    }
  }
}

// 导出单例实例
const authServiceInstance = new AuthService()
export const authService = authServiceInstance
