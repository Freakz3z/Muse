/**
 * Vitest 测试环境设置
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// 扩展 Vitest 的 expect 断言
expect.extend(matchers)

// 每个测试后清理
afterEach(() => {
  cleanup()
})

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as unknown as number
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

// 模拟 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// 模拟 electronAPI
Object.defineProperty(window, 'electronAPI', {
  value: {
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
    getWindowState: vi.fn().mockResolvedValue({ isMaximized: false }),
    onMaximizeChange: vi.fn(),
    openExternal: vi.fn(),
    hideFloatingWindow: vi.fn(),
    showFloatingWindow: vi.fn(),
    toggleFloatingWindow: vi.fn(),
    notifyDataUpdated: vi.fn(),
    onDataUpdated: vi.fn(),
    updateFloatingShortcut: vi.fn(),
    getFloatingShortcut: vi.fn().mockResolvedValue('Alt+X'),
  },
  writable: true,
})
