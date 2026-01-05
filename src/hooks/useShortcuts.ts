import { useEffect, useRef } from 'react'
import { useAppStore } from '../store'
import { ShortcutSettings, defaultShortcuts } from '../types'

// 修饰键到显示符号的映射
const modifierKeyToDisplay: Record<string, string> = {
  'Alt': 'Alt',
  'Control': 'Ctrl',
  'Shift': 'Shift',
  'Meta': 'Win',
}

// 快捷键代码到显示名称的映射
export const keyCodeToDisplay: Record<string, string> = {
  'Space': '空格',
  'KeyA': 'A',
  'KeyB': 'B',
  'KeyC': 'C',
  'KeyD': 'D',
  'KeyE': 'E',
  'KeyF': 'F',
  'KeyG': 'G',
  'KeyH': 'H',
  'KeyI': 'I',
  'KeyJ': 'J',
  'KeyK': 'K',
  'KeyL': 'L',
  'KeyM': 'M',
  'KeyN': 'N',
  'KeyO': 'O',
  'KeyP': 'P',
  'KeyQ': 'Q',
  'KeyR': 'R',
  'KeyS': 'S',
  'KeyT': 'T',
  'KeyU': 'U',
  'KeyV': 'V',
  'KeyW': 'W',
  'KeyX': 'X',
  'KeyY': 'Y',
  'KeyZ': 'Z',
  'Digit0': '0',
  'Digit1': '1',
  'Digit2': '2',
  'Digit3': '3',
  'Digit4': '4',
  'Digit5': '5',
  'Digit6': '6',
  'Digit7': '7',
  'Digit8': '8',
  'Digit9': '9',
  'Enter': '回车',
  'Escape': 'Esc',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'Tab': 'Tab',
  'Backspace': '退格',
}

// 解析快捷键字符串（支持组合键）
// 格式: "Alt+KeyX" 或 "KeyA" 或 "Control+Shift+KeyD"
export function parseShortcut(shortcut: string): { modifiers: string[]; key: string } {
  const parts = shortcut.split('+').map(p => p.trim())
  const modifiers: string[] = []
  let key = ''

  for (const part of parts) {
    if (['Alt', 'Control', 'Shift', 'Meta'].includes(part)) {
      modifiers.push(part)
    } else {
      key = part
    }
  }

  return { modifiers, key }
}

// 获取快捷键的显示名称
export function getShortcutDisplay(code: string): string {
  const { modifiers, key } = parseShortcut(code)
  const modifierDisplay = modifiers.map(m => modifierKeyToDisplay[m] || m).join('+')
  const keyDisplay = keyCodeToDisplay[key] || key

  return modifierDisplay ? `${modifierDisplay}+${keyDisplay}` : keyDisplay
}

// 检查快捷键是否匹配
export function matchShortcut(shortcut: string, event: KeyboardEvent): boolean {
  const { modifiers, key } = parseShortcut(shortcut)

  // 检查修饰键
  if (modifiers.includes('Alt') && !event.altKey) return false
  if (modifiers.includes('Control') && !event.ctrlKey) return false
  if (modifiers.includes('Shift') && !event.shiftKey) return false
  if (modifiers.includes('Meta') && !event.metaKey) return false

  // 确保不匹配额外的修饰键
  if (!modifiers.includes('Alt') && event.altKey) return false
  if (!modifiers.includes('Control') && event.ctrlKey) return false
  if (!modifiers.includes('Shift') && event.shiftKey) return false
  if (!modifiers.includes('Meta') && event.metaKey) return false

  // 检查主键
  return event.code === key
}

// 快捷键动作类型
export type ShortcutAction = keyof ShortcutSettings

interface ShortcutHandlers {
  showAnswer?: () => void
  markKnown?: () => void
  markUnknown?: () => void
  playAudio?: () => void
  showAIAnalysis?: () => void
  rateEasy?: () => void
  rateGood?: () => void
  rateHard?: () => void
  rateAgain?: () => void
  toggleFloating?: () => void
}

// 使用快捷键的 Hook
export function useShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  const { settings } = useAppStore()
  // 确保 shortcuts 有默认值
  const shortcuts = settings.shortcuts || defaultShortcuts

  // 使用 ref 存储最新的 handlers，避免依赖变化导致重复绑定
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  // 使用 ref 存储 shortcuts，确保能获取到最新的快捷键设置
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  // 当 shortcuts 变化时，更新 ref
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入框中，不处理快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        !enabledRef.current
      ) {
        return
      }

      // 获取最新的 shortcuts
      const currentShortcuts = shortcutsRef.current
      if (!currentShortcuts) return

      const currentHandlers = handlersRef.current

      // 匹配快捷键并执行对应操作（使用 matchShortcut 支持组合键）
      if (matchShortcut(currentShortcuts.showAnswer, e) && currentHandlers.showAnswer) {
        e.preventDefault()
        currentHandlers.showAnswer()
      } else if (matchShortcut(currentShortcuts.markKnown, e) && currentHandlers.markKnown) {
        e.preventDefault()
        currentHandlers.markKnown()
      } else if (matchShortcut(currentShortcuts.markUnknown, e) && currentHandlers.markUnknown) {
        e.preventDefault()
        currentHandlers.markUnknown()
      } else if (matchShortcut(currentShortcuts.playAudio, e) && currentHandlers.playAudio) {
        e.preventDefault()
        currentHandlers.playAudio()
      } else if (matchShortcut(currentShortcuts.showAIAnalysis, e) && currentHandlers.showAIAnalysis) {
        e.preventDefault()
        currentHandlers.showAIAnalysis()
      } else if (matchShortcut(currentShortcuts.rateEasy, e) && currentHandlers.rateEasy) {
        e.preventDefault()
        currentHandlers.rateEasy()
      } else if (matchShortcut(currentShortcuts.rateGood, e) && currentHandlers.rateGood) {
        e.preventDefault()
        currentHandlers.rateGood()
      } else if (matchShortcut(currentShortcuts.rateHard, e) && currentHandlers.rateHard) {
        e.preventDefault()
        currentHandlers.rateHard()
      } else if (matchShortcut(currentShortcuts.rateAgain, e) && currentHandlers.rateAgain) {
        e.preventDefault()
        currentHandlers.rateAgain()
      } else if (matchShortcut(currentShortcuts.toggleFloating, e) && currentHandlers.toggleFloating) {
        e.preventDefault()
        currentHandlers.toggleFloating()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // 移除 shortcuts 依赖，使用 ref 来获取最新的值
}

// 快捷键提示组件 props
export interface ShortcutHintProps {
  action: ShortcutAction
  className?: string
}
