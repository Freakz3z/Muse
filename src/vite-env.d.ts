export {}

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
      getWindowState: () => Promise<{ isMaximized: boolean }>
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
      // 剪贴板翻译
      onClipboardTranslate: (callback: (event: any, text: string) => void) => void
      removeClipboardTranslateListener: () => void
    }
  }
}
