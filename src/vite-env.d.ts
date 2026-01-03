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
    }
  }
}
