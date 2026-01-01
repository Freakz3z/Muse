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

      // 确保 shortcuts 存在
      if (!shortcuts) return

      const code = e.code
      const currentHandlers = handlersRef.current
      
      // 匹配快捷键并执行对应操作
      if (code === shortcuts.showAnswer && currentHandlers.showAnswer) {
        e.preventDefault()
        currentHandlers.showAnswer()
      } else if (code === shortcuts.prevWord && currentHandlers.prevWord) {
        e.preventDefault()
        currentHandlers.prevWord()
      } else if (code === shortcuts.nextWord && currentHandlers.nextWord) {
        e.preventDefault()
        currentHandlers.nextWord()
      } else if (code === shortcuts.markKnown && currentHandlers.markKnown) {
        e.preventDefault()
        currentHandlers.markKnown()
      } else if (code === shortcuts.markUnknown && currentHandlers.markUnknown) {
        e.preventDefault()
        currentHandlers.markUnknown()
      } else if (code === shortcuts.playAudio && currentHandlers.playAudio) {
        e.preventDefault()
        currentHandlers.playAudio()
      } else if (code === shortcuts.rateEasy && currentHandlers.rateEasy) {
        e.preventDefault()
        currentHandlers.rateEasy()
      } else if (code === shortcuts.rateGood && currentHandlers.rateGood) {
        e.preventDefault()
        currentHandlers.rateGood()
      } else if (code === shortcuts.rateHard && currentHandlers.rateHard) {
        e.preventDefault()
        currentHandlers.rateHard()
      } else if (code === shortcuts.rateAgain && currentHandlers.rateAgain) {
        e.preventDefault()
        currentHandlers.rateAgain()
      } else if (code === shortcuts.toggleFloating && currentHandlers.toggleFloating) {
        e.preventDefault()
        currentHandlers.toggleFloating()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// 快捷键提示组件 props
export interface ShortcutHintProps {
  action: ShortcutAction
  className?: string
}
