/**
 * 统一的日志工具
 * 根据环境变量自动控制日志输出
 *
 * 开发环境：显示所有日志
 * 生产环境：只显示错误日志
 */

const isDev = import.meta.env.DEV

interface Logger {
  log: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

/**
 * 日志级别枚举
 */
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 当前日志级别
 */
const currentLogLevel: LogLevel = isDev ? LogLevel.DEBUG : LogLevel.ERROR

/**
 * 格式化日志前缀
 */
function formatPrefix(level: string, context?: string): string {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
  const prefix = context ? `[${timestamp}] [${level}] [${context}]` : `[${timestamp}] [${level}]`
  return prefix
}

/**
 * 彩色日志样式（仅浏览器）
 */
const styles = {
  debug: 'color: #6b7280; font-weight: normal',
  info: 'color: #3b82f6; font-weight: normal',
  warn: 'color: #f59e0b; font-weight: normal',
  error: 'color: #ef4444; font-weight: bold',
}

/**
 * 统一日志实例
 */
export const logger: Logger = {
  /**
   * DEBUG 级别日志 - 仅开发环境
   */
  debug: (...args: unknown[]) => {
    if (isDev && currentLogLevel <= LogLevel.DEBUG) {
      const prefix = formatPrefix('DEBUG')
      console.debug(`%c${prefix}`, styles.debug, ...args)
    }
  },

  /**
   * INFO 级别日志 - 仅开发环境
   */
  log: (...args: unknown[]) => {
    if (isDev && currentLogLevel <= LogLevel.INFO) {
      const prefix = formatPrefix('INFO')
      console.info(`%c${prefix}`, styles.info, ...args)
    }
  },

  /**
   * INFO 级别日志别名
   */
  info: (...args: unknown[]) => {
    if (isDev && currentLogLevel <= LogLevel.INFO) {
      const prefix = formatPrefix('INFO')
      console.info(`%c${prefix}`, styles.info, ...args)
    }
  },

  /**
   * WARN 级别日志 - 开发和生产环境都显示
   */
  warn: (...args: unknown[]) => {
    if (currentLogLevel <= LogLevel.WARN) {
      const prefix = formatPrefix('WARN')
      console.warn(`%c${prefix}`, styles.warn, ...args)
    }
  },

  /**
   * ERROR 级别日志 - 开发和生产环境都显示
   */
  error: (...args: unknown[]) => {
    if (currentLogLevel <= LogLevel.ERROR) {
      const prefix = formatPrefix('ERROR')
      console.error(`%c${prefix}`, styles.error, ...args)
    }
  },
}

/**
 * 创建带上下文的日志实例
 * @param context 上下文名称
 * @returns 带上下文的日志实例
 *
 * @example
 * const log = createLogger('MyComponent')
 * log.info('用户登录成功')
 * log.error('网络请求失败', error)
 */
export function createLogger(context: string): Logger {
  return {
    debug: (...args: unknown[]) => {
      if (isDev && currentLogLevel <= LogLevel.DEBUG) {
        const prefix = formatPrefix('DEBUG', context)
        console.debug(`%c${prefix}`, styles.debug, ...args)
      }
    },
    log: (...args: unknown[]) => {
      if (isDev && currentLogLevel <= LogLevel.INFO) {
        const prefix = formatPrefix('INFO', context)
        console.info(`%c${prefix}`, styles.info, ...args)
      }
    },
    info: (...args: unknown[]) => {
      if (isDev && currentLogLevel <= LogLevel.INFO) {
        const prefix = formatPrefix('INFO', context)
        console.info(`%c${prefix}`, styles.info, ...args)
      }
    },
    warn: (...args: unknown[]) => {
      if (currentLogLevel <= LogLevel.WARN) {
        const prefix = formatPrefix('WARN', context)
        console.warn(`%c${prefix}`, styles.warn, ...args)
      }
    },
    error: (...args: unknown[]) => {
      if (currentLogLevel <= LogLevel.ERROR) {
        const prefix = formatPrefix('ERROR', context)
        console.error(`%c${prefix}`, styles.error, ...args)
      }
    },
  }
}

/**
 * 性能测量工具
 *
 * @example
 * const perf = startPerformance('数据加载')
 * await loadData()
 * perf.end()
 */
export function startPerformance(label: string) {
  if (isDev) {
    const startTime = performance.now()
    return {
      end: () => {
        const duration = performance.now() - startTime
        logger.debug(`[性能] ${label}: ${duration.toFixed(2)}ms`)
      },
    }
  }
  return {
    end: () => {},
  }
}

export default logger
