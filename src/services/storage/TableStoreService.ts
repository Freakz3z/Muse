/**
 * 阿里云表格存储服务封装
 * 用于用户数据同步和缓存
 */

// TODO: 安装表格存储SDK: npm install @alicloud/tablestore2020

// 表结构定义
export interface UserProgressData {
  userId: string
  todayNewWords: number
  todayReviewedWords: number
  studyTime: number
  streak: number
  lastStudyAt: number
  totalWords: number
  updatedAt: number
}

export interface WordRecordData {
  userId: string
  word: string
  masteryLevel: number
  nextReviewAt: number
  reviewCount: number
  correctCount: number
  lastReviewAt: number
  easeFactor: number
  interval: number
  updatedAt: number
}

export interface AICacheData {
  key: string
  value: string
  expiredAt: number
  createdAt: number
}

class TableStoreService {
  private enabled: boolean = false

  async initialize(_config: {
    accessKeyId: string
    accessKeySecret: string
    endpoint: string
    instanceName: string
  }) {
    try {
      this.enabled = true
      console.log('✅ TableStore 初始化成功 (模拟模式)')
    } catch (error) {
      console.error('❌ TableStore 初始化失败:', error)
      this.enabled = false
    }
  }

  async saveUserProgress(_userId: string, _data: Omit<UserProgressData, 'userId' | 'updatedAt'>): Promise<boolean> {
    if (!this.enabled) return false
    console.log('💾 保存用户进度 (模拟)')
    return true
  }

  async getUserProgress(_userId: string): Promise<UserProgressData | null> {
    if (!this.enabled) return null
    return null
  }

  async batchSaveWordRecords(_userId: string, _words: Array<{
    word: string
    data: Omit<WordRecordData, 'userId' | 'word' | 'updatedAt'>
  }>): Promise<boolean> {
    if (!this.enabled) return false
    console.log('💾 批量保存单词记录 (模拟)')
    return true
  }

  async saveAICache(_key: string, _value: any, _ttl: number = 7 * 24 * 60 * 60 * 1000): Promise<boolean> {
    if (!this.enabled) return false
    return true
  }

  async getAICache(_key: string): Promise<any | null> {
    if (!this.enabled) return null
    return null
  }

  async deleteAICache(_key: string): Promise<boolean> {
    if (!this.enabled) return false
    return true
  }

  isEnabled(): boolean {
    return this.enabled
  }
}

export const tableStoreService = new TableStoreService()
