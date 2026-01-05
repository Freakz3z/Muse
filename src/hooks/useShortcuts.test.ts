/**
 * useShortcuts 快捷键功能单元测试
 */

import { describe, it, expect } from 'vitest'
import { parseShortcut, matchShortcut, getShortcutDisplay } from './useShortcuts'

describe('parseShortcut', () => {
  it('应该正确解析单一按键', () => {
    const result = parseShortcut('KeyA')
    expect(result).toEqual({
      modifiers: [],
      key: 'KeyA',
    })
  })

  it('应该正确解析组合键 - Alt+KeyX', () => {
    const result = parseShortcut('Alt+KeyX')
    expect(result).toEqual({
      modifiers: ['Alt'],
      key: 'KeyX',
    })
  })

  it('应该正确解析多修饰键组合', () => {
    const result = parseShortcut('Control+Shift+KeyD')
    expect(result).toEqual({
      modifiers: ['Control', 'Shift'],
      key: 'KeyD',
    })
  })

  it('应该正确解析所有修饰键组合', () => {
    const result = parseShortcut('Alt+Control+Shift+Meta+KeyA')
    expect(result).toEqual({
      modifiers: ['Alt', 'Control', 'Shift', 'Meta'],
      key: 'KeyA',
    })
  })

  it('应该处理带空格的输入', () => {
    const result = parseShortcut(' Alt + KeyX ')
    expect(result).toEqual({
      modifiers: ['Alt'],
      key: 'KeyX',
    })
  })
})

describe('matchShortcut', () => {
  it('应该匹配单一按键', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyA' })
    expect(matchShortcut('KeyA', event)).toBe(true)
    expect(matchShortcut('KeyB', event)).toBe(false)
  })

  it('应该匹配 Alt 组合键', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyX',
      altKey: true,
    })
    expect(matchShortcut('Alt+KeyX', event)).toBe(true)
    expect(matchShortcut('KeyX', event)).toBe(false)
  })

  it('应该匹配 Ctrl 组合键', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyD',
      ctrlKey: true,
    })
    expect(matchShortcut('Control+KeyD', event)).toBe(true)
  })

  it('应该匹配多修饰键组合', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyD',
      ctrlKey: true,
      shiftKey: true,
    })
    expect(matchShortcut('Control+Shift+KeyD', event)).toBe(true)
    expect(matchShortcut('Control+KeyD', event)).toBe(false)
  })

  it('应该拒绝缺少必需修饰键的事件', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyX',
      ctrlKey: false,
    })
    expect(matchShortcut('Control+KeyX', event)).toBe(false)
  })

  it('应该拒绝带有额外修饰键的事件', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyA',
      altKey: true,
      shiftKey: true, // 额外的修饰键
    })
    expect(matchShortcut('Alt+KeyA', event)).toBe(false)
  })

  it('应该匹配 Meta (Win) 键', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyX',
      metaKey: true,
    })
    expect(matchShortcut('Meta+KeyX', event)).toBe(true)
  })

  it('应该匹配 Shift 组合键', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'KeyA',
      shiftKey: true,
    })
    expect(matchShortcut('Shift+KeyA', event)).toBe(true)
  })
})

describe('getShortcutDisplay', () => {
  it('应该正确显示单一按键', () => {
    expect(getShortcutDisplay('KeyA')).toBe('A')
    expect(getShortcutDisplay('Space')).toBe('空格')
    expect(getShortcutDisplay('Enter')).toBe('回车')
  })

  it('应该正确显示组合键', () => {
    expect(getShortcutDisplay('Alt+KeyX')).toBe('Alt+X')
    expect(getShortcutDisplay('Control+KeyD')).toBe('Ctrl+D')
    expect(getShortcutDisplay('Shift+Space')).toBe('Shift+空格')
  })

  it('应该正确显示多修饰键组合', () => {
    expect(getShortcutDisplay('Control+Shift+KeyD')).toBe('Ctrl+Shift+D')
    expect(getShortcutDisplay('Alt+Control+KeyX')).toBe('Alt+Ctrl+X')
  })

  it('应该正确显示 Meta 键', () => {
    expect(getShortcutDisplay('Meta+KeyX')).toBe('Win+X')
  })

  it('应该正确显示数字键', () => {
    expect(getShortcutDisplay('Digit1')).toBe('1')
    expect(getShortcutDisplay('Control+Digit5')).toBe('Ctrl+5')
  })

  it('应该正确显示方向键', () => {
    expect(getShortcutDisplay('ArrowUp')).toBe('↑')
    expect(getShortcutDisplay('Control+ArrowDown')).toBe('Ctrl+↓')
  })

  it('应该对未知按键返回原始值', () => {
    expect(getShortcutDisplay('UnknownKey')).toBe('UnknownKey')
    expect(getShortcutDisplay('Alt+UnknownKey')).toBe('Alt+UnknownKey')
  })

  it('应该正确显示 Escape 和 Tab', () => {
    expect(getShortcutDisplay('Escape')).toBe('Esc')
    expect(getShortcutDisplay('Tab')).toBe('Tab')
  })

  it('应该正确显示 Backspace', () => {
    expect(getShortcutDisplay('Backspace')).toBe('退格')
  })
})
