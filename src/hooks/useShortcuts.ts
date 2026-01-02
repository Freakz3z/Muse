import { useEffect, useRef } from 'react'
import { useAppStore } from '../store'
import { ShortcutSettings, defaultShortcuts } from '../types'

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

// 获取快捷键的显示名称
export function getShortcutDisplay(code: string): string {
  return keyCodeToDisplay[code] || code
}

// 快捷键动作类型
export type ShortcutAction = keyof ShortcutSettings

interface ShortcutHandlers {
  showAnswer?: () => void
  prevWord?: () => void
  nextWord?: () => void
  markKnown?: () => void
  markUnknown?: () => void
  playAudio?: () => void
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

      const code = e.code
      const currentHandlers = handlersRef.current

      // 匹配快捷键并执行对应操作
      if (code === currentShortcuts.showAnswer && currentHandlers.showAnswer) {
        e.preventDefault()
        currentHandlers.showAnswer()
      } else if (code === currentShortcuts.prevWord && currentHandlers.prevWord) {
        e.preventDefault()
        currentHandlers.prevWord()
      } else if (code === currentShortcuts.nextWord && currentHandlers.nextWord) {
        e.preventDefault()
        currentHandlers.nextWord()
      } else if (code === currentShortcuts.markKnown && currentHandlers.markKnown) {
        e.preventDefault()
        currentHandlers.markKnown()
      } else if (code === currentShortcuts.markUnknown && currentHandlers.markUnknown) {
        e.preventDefault()
        currentHandlers.markUnknown()
      } else if (code === currentShortcuts.playAudio && currentHandlers.playAudio) {
        e.preventDefault()
        currentHandlers.playAudio()
      } else if (code === currentShortcuts.rateEasy && currentHandlers.rateEasy) {
        e.preventDefault()
        currentHandlers.rateEasy()
      } else if (code === currentShortcuts.rateGood && currentHandlers.rateGood) {
        e.preventDefault()
        currentHandlers.rateGood()
      } else if (code === currentShortcuts.rateHard && currentHandlers.rateHard) {
        e.preventDefault()
        currentHandlers.rateHard()
      } else if (code === currentShortcuts.rateAgain && currentHandlers.rateAgain) {
        e.preventDefault()
        currentHandlers.rateAgain()
      } else if (code === currentShortcuts.toggleFloating && currentHandlers.toggleFloating) {
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
