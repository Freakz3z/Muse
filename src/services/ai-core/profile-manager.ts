/**
 * AI Learner Profile Manager
 *
 * 职责：管理用户画像的生命周期
 * - 创建默认画像
 * - 持久化存储
 * - 加载和更新
 */

import { AILearnerProfile, createDefaultProfile, LearningEvent, ProfileUpdateResult } from '../../types/learner-profile';
import localforage from 'localforage';

// LocalForage 类型定义
interface LocalForage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<T>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  length(): Promise<number>;
  keys(): Promise<string[]>;
  createInstance(options: {
    name?: string;
    storeName?: string;
    driver?: string | string[];
    version?: number;
    size?: number;
    description?: string;
  }): LocalForage;
}

const PROFILE_STORAGE_KEY = 'ai_learner_profile';
const MIN_EVENTS_FOR_UPDATE = 5; // 最少收集5个事件后才进行AI更新
const MAX_EVENTS = 100; // 最多保留100个事件（用于滑动窗口）

interface ProfileStorage {
  profile: AILearnerProfile;
  pendingEvents: LearningEvent[];
  lastAIUpdate: number;
}

/**
 * Profile Manager Class
 */
export class ProfileManager {
  private storage: LocalForage;
  private cache: AILearnerProfile | null = null;

  constructor() {
    this.storage = localforage.createInstance({
      name: 'muse_ai_profile',
      storeName: 'profiles',
    });
  }

  /**
   * 初始化：加载或创建画像
   */
  async initialize(userId: string): Promise<AILearnerProfile> {
    try {
      const data = await this.storage.getItem<ProfileStorage>(PROFILE_STORAGE_KEY);

      if (!data || data.profile.userId !== userId) {
        // 创建新画像
        const newProfile = createDefaultProfile(userId);
        const storageData: ProfileStorage = {
          profile: newProfile,
          pendingEvents: [],
          lastAIUpdate: Date.now(),
        };

        await this.storage.setItem(PROFILE_STORAGE_KEY, storageData);
        this.cache = newProfile;

        console.log('[ProfileManager] Created new profile for user:', userId);
        return newProfile;
      }

      this.cache = data.profile;
      console.log('[ProfileManager] Loaded existing profile for user:', userId);
      return data.profile;
    } catch (error) {
      console.error('[ProfileManager] Failed to initialize profile:', error);
      throw error;
    }
  }

  /**
   * 获取当前画像（从缓存）
   */
  getProfile(): AILearnerProfile | null {
    return this.cache;
  }

  /**
   * 记录学习事件
   *
   * 事件会被累积，达到阈值后触发AI更新
   */
  async recordEvent(event: LearningEvent): Promise<void> {
    try {
      const data = await this.storage.getItem<ProfileStorage>(PROFILE_STORAGE_KEY);
      if (!data) return;

      // 添加事件到待处理队列
      data.pendingEvents.push(event);

      // 限制队列大小（滑动窗口）
      if (data.pendingEvents.length > MAX_EVENTS) {
        data.pendingEvents = data.pendingEvents.slice(-MAX_EVENTS);
      }

      await this.storage.setItem(PROFILE_STORAGE_KEY, data);

      console.log('[ProfileManager] Recorded event, pending count:', data.pendingEvents.length);

      // 检查是否需要触发AI更新
      if (data.pendingEvents.length >= MIN_EVENTS_FOR_UPDATE) {
        await this.triggerAIUpdate(data);
      }
    } catch (error) {
      console.error('[ProfileManager] Failed to record event:', error);
    }
  }

  /**
   * 触发AI更新画像
   *
   * 这是最核心的功能：用AI分析学习事件，更新用户画像
   */
  private async triggerAIUpdate(storageData: ProfileStorage): Promise<void> {
    console.log('[ProfileManager] Triggering AI profile update...');

    try {
      // 动态导入ProfileUpdater避免循环依赖
      const { getProfileUpdater } = await import('./profile-updater');
      const updater = getProfileUpdater();

      // 使用AI分析事件并更新画像
      const result = await updater.updateProfile(
        storageData.profile,
        storageData.pendingEvents
      );

      if (result.success) {
        // 更新画像
        storageData.profile = {
          ...storageData.profile,
          ...result.changes.reduce((acc, change) => ({ ...acc, [change.dimension]: change.after }), {}),
          version: storageData.profile.version + 1,
          lastUpdated: Date.now(),
        };

        console.log('[ProfileManager] Profile updated successfully:', result.updatedDimensions);
      } else {
        console.warn('[ProfileManager] Profile update failed, keeping events for retry');
        // 如果更新失败，保留事件稍后重试
        await this.storage.setItem(PROFILE_STORAGE_KEY, storageData);
        return;
      }
    } catch (error) {
      console.error('[ProfileManager] AI update failed:', error);
      // 出错时也保留事件
      await this.storage.setItem(PROFILE_STORAGE_KEY, storageData);
      return;
    }

    // 清空已处理的事件
    storageData.pendingEvents = [];
    storageData.lastAIUpdate = Date.now();

    await this.storage.setItem(PROFILE_STORAGE_KEY, storageData);
    this.cache = storageData.profile;

    console.log('[ProfileManager] Profile update completed');
  }

  /**
   * 手动触发更新（强制立即更新）
   */
  async forceUpdate(): Promise<ProfileUpdateResult> {
    console.log('[ProfileManager] Force updating profile...');

    // TODO: 实现AI调用
    return {
      success: false,
      updatedDimensions: [],
      confidence: 0,
      changes: [],
    };
  }

  /**
   * 导出画像（用于诊断报告）
   */
  async exportProfile(): Promise<string> {
    const profile = this.cache;
    if (!profile) {
      throw new Error('No profile loaded');
    }

    return JSON.stringify(profile, null, 2);
  }

  /**
   * 清除所有数据（用于测试或重置）
   */
  async clear(): Promise<void> {
    await this.storage.removeItem(PROFILE_STORAGE_KEY);
    this.cache = null;
    console.log('[ProfileManager] Profile cleared');
  }

  /**
   * 获取画像统计信息
   */
  async getStats() {
    const data = await this.storage.getItem<ProfileStorage>(PROFILE_STORAGE_KEY);
    if (!data) {
      return null;
    }

    return {
      profileVersion: data.profile.version,
      pendingEvents: data.pendingEvents.length,
      lastAIUpdate: new Date(data.lastAIUpdate).toISOString(),
      vocabularySize: data.profile.knowledgeGraph.vocabularySize,
      masteredDomains: data.profile.knowledgeGraph.masteredDomains,
    };
  }
}

// 单例
let profileManagerInstance: ProfileManager | null = null;

export const getProfileManager = (): ProfileManager => {
  if (!profileManagerInstance) {
    profileManagerInstance = new ProfileManager();
  }
  return profileManagerInstance;
};
