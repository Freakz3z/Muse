/**
 * 日志工具单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { logger, createLogger } from './logger'

describe('logger', () => {
  let consoleLogSpy: any
  let consoleInfoSpy: any
  let consoleWarnSpy: any
  let consoleErrorSpy: any
  let consoleDebugSpy: any

  beforeEach(() => {
    // 模拟 console 方法
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    // 恢复 console 方法
    consoleLogSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleDebugSpy.mockRestore()
  })

  describe('log/info', () => {
    it('应该在开发环境输出日志', () => {
      logger.log('测试日志')

      if (import.meta.env.DEV) {
        expect(consoleInfoSpy).toHaveBeenCalled()
      } else {
        expect(consoleInfoSpy).not.toHaveBeenCalled()
      }
    })

    it('应该接受多个参数', () => {
      logger.log('消息', { data: 'test' }, 123)

      if (import.meta.env.DEV) {
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('[INFO]'),
          expect.any(String),
          '消息',
          { data: 'test' },
          123
        )
      }
    })

    it('info 应该与 log 行为一致', () => {
      logger.info('info 消息')

      if (import.meta.env.DEV) {
        expect(consoleInfoSpy).toHaveBeenCalled()
      }
    })
  })

  describe('warn', () => {
    it('应该始终输出警告', () => {
      logger.warn('警告信息')

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('应该包含正确的日志级别', () => {
      logger.warn('警告信息')

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.any(String),
        expect.anything()
      )
    })

    it('应该接受多个参数', () => {
      logger.warn('警告', { details: 'test' })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        expect.any(String),
        '警告',
        { details: 'test' }
      )
    })
  })

  describe('error', () => {
    it('应该始终输出错误', () => {
      logger.error('错误信息')

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('应该包含正确的日志级别', () => {
      logger.error('错误信息')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.any(String),
        expect.anything()
      )
    })

    it('应该接受错误对象', () => {
      const error = new Error('测试错误')
      logger.error('发生错误:', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.any(String),
        '发生错误:',
        error
      )
    })

    it('应该始终被调用（生产环境也输出）', () => {
      logger.error('严重错误')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('debug', () => {
    it('应该仅在开发环境输出', () => {
      logger.debug('调试信息')

      if (import.meta.env.DEV) {
        expect(consoleDebugSpy).toHaveBeenCalled()
      } else {
        expect(consoleDebugSpy).not.toHaveBeenCalled()
      }
    })
  })
})

describe('createLogger', () => {
  let consoleInfoSpy: any
  let consoleWarnSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('应该创建带上下文的日志实例', () => {
    const log = createLogger('TestComponent')

    log.info('测试消息')

    if (import.meta.env.DEV) {
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestComponent]'),
        expect.any(String),
        expect.anything()
      )
    }
  })

  it('应该在所有日志方法中包含上下文', () => {
    const log = createLogger('MyComponent')

    log.info('info')
    log.warn('warn')
    log.error('error')

    if (import.meta.env.DEV) {
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MyComponent]'),
        expect.any(String),
        expect.anything()
      )
    }

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[MyComponent]'),
      expect.any(String),
      expect.anything()
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[MyComponent]'),
      expect.any(String),
      expect.anything()
    )
  })

  it('应该创建独立的日志实例', () => {
    const log1 = createLogger('Component1')
    const log2 = createLogger('Component2')

    log1.info('消息1')
    log2.info('消息2')

    if (import.meta.env.DEV) {
      expect(consoleInfoSpy).toHaveBeenCalledTimes(2)
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Component1]'),
        expect.any(String),
        expect.anything()
      )
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Component2]'),
        expect.any(String),
        expect.anything()
      )
    }
  })

  it('应该支持特殊字符的上下文名称', () => {
    const log = createLogger('测试组件')

    log.info('测试消息')

    if (import.meta.env.DEV) {
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[测试组件]'),
        expect.any(String),
        expect.anything()
      )
    }
  })

  it('应该支持嵌套组件名称', () => {
    const log = createLogger('Parent/Child/GrandChild')

    log.info('嵌套消息')

    if (import.meta.env.DEV) {
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Parent/Child/GrandChild]'),
        expect.any(String),
        expect.anything()
      )
    }
  })
})

describe('startPerformance', () => {
  it('应该在开发环境导出 startPerformance 函数', async () => {
    const { startPerformance } = await import('./logger')
    expect(typeof startPerformance).toBe('function')
  })

  it('应该返回带有 end 方法的对象', async () => {
    if (!import.meta.env.DEV) {
      return
    }

    const { startPerformance } = await import('./logger')
    const perf = startPerformance('测试操作')

    expect(perf).toBeDefined()
    expect(typeof perf.end).toBe('function')
  })

  it('end 方法不应该抛出错误', async () => {
    if (!import.meta.env.DEV) {
      return
    }

    const { startPerformance } = await import('./logger')
    const perf = startPerformance('测试操作')

    expect(() => perf.end()).not.toThrow()
  })
})
