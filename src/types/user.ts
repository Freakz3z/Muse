/**
 * 用户系统类型定义
 */

export interface User {
  id: string
  username: string
  email?: string
  nickname: string
  avatar?: string
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  goal: 'casual' | 'daily' | 'intensive'
  interests: string[]
  createdAt: number
  lastLoginAt: number
}

export interface UserProfile {
  userId: string
  nickname: string
  level: string
  goal: string
  interests: string[]
  streak: number
  totalWords: number
  lastStudyAt: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email?: string
  password: string
  nickname: string
}

export interface UserStatistics {
  totalStudyDays: number
  totalWordsLearned: number
  totalReviews: number
  averageAccuracy: number
  longestStreak: number
}
