/**
 * 存储同步机制单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { triggerSync, onSync } from './index'

describe('跨窗口同步机制', () => {
  let originalLocalStorage: Storage

  beforeEach(() => {
    // 保存原始 localStorage
    originalLocalStorage = global.localStorage

    // 模拟 localStorage - 简化版本，不触发实际事件
    const mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }

    // 覆盖 global.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    })
  })

  afterEach(() => {
    // 恢复原始 localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
  })

  describe('triggerSync', () => {
    it('应该使用防抖机制', async () => {
      const setItemSpy = vi.spyOn(global.localStorage, 'setItem')

      // 快速触发多次
      triggerSync()
      triggerSync()
      triggerSync()

      // 等待防抖时间（100ms + 一些余量）
      await new Promise(resolve => setTimeout(resolve, 150))

      // 应该只调用一次
      expect(setItemSpy).toHaveBeenCalledTimes(1)
    })

    it('应该设置正确的键', async () => {
      const setItemSpy = vi.spyOn(global.localStorage, 'setItem')

      triggerSync()

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(setItemSpy).toHaveBeenCalledWith(
        'muse_sync_timestamp',
        expect.any(String)
      )
    })

    it('应该设置时间戳', async () => {
      const setItemSpy = vi.spyOn(global.localStorage, 'setItem')

      const before = Date.now()
      triggerSync()
      await new Promise(resolve => setTimeout(resolve, 150))
      const after = Date.now()

      const timestamp = parseInt(setItemSpy.mock.calls[0][1] as string)
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('应该返回 undefined', () => {
      const result = triggerSync()
      expect(result).toBeUndefined()
    })
  })

  describe('onSync', () => {
    it('应该返回函数', () => {
      const callback = vi.fn()
      const unsubscribe = onSync(callback)
      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('应该返回的函数可以被调用', () => {
      const callback = vi.fn()
      const unsubscribe = onSync(callback)

      expect(() => unsubscribe()).not.toThrow()
    })

    it('应该支持多个监听器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const unsubscribe1 = onSync(callback1)
      const unsubscribe2 = onSync(callback2)

      // 清理
      unsubscribe1()
      unsubscribe2()

      // 验证监听器被创建
      expect(typeof unsubscribe1).toBe('function')
      expect(typeof unsubscribe2).toBe('function')
    })
  })

  describe('集成测试', () => {
    it('triggerSync 不应该抛出错误', async () => {
      expect(() => {
        triggerSync()
      }).not.toThrow()
    })

    it('多次 triggerSync 不应该抛出错误', () => {
      expect(() => {
        triggerSync()
        triggerSync()
        triggerSync()
      }).not.toThrow()
    })

    it('取消订阅后不应该抛出错误', () => {
      const callback = vi.fn()
      const unsubscribe = onSync(callback)

      expect(() => {
        unsubscribe()
        triggerSync()
      }).not.toThrow()
    })

    it('应该正确处理快速连续的同步触发', async () => {
      expect(() => {
        triggerSync()
        triggerSync()
      }).not.toThrow()
    })
  })
})
