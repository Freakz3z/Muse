export {}

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      maximize: () => void
      close: () => void
      getWindowState: () => Promise<{ isMaximized: boolean }>
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
    }
  }
}
