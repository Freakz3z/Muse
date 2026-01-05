/// <reference types="vite/client" />

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

declare module '*.gif' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.ico' {
  const value: string
  export default value
}

export {}

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      maximize: () => void
      close: () => void
      getWindowState: () => Promise<{ isMaximized: boolean }>
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
      openExternal: (url: string) => void
      // 悬浮窗控制
      hideFloatingWindow: () => void
      showFloatingWindow: () => void
      toggleFloatingWindow: () => void
      notifyDataUpdated: () => void
      onDataUpdated: (callback: () => void) => void
      // 快捷键管理
      updateFloatingShortcut: (shortcut: string) => void
      getFloatingShortcut: () => Promise<string>
      // 更新检查
      checkForUpdate: () => Promise<{
        hasUpdate: boolean
        currentVersion: string
        latestVersion?: string
        downloadUrl?: string
        notes?: string
      }>
      openDownloadPage: (url: string) => void
      onUpdateAvailable: (callback: (updateInfo: any) => void) => void
    }
    // 全局检查更新函数
    checkForUpdate?: () => Promise<void>
  }
}
