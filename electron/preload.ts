import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('maximize-change', (_, isMaximized) => callback(isMaximized))
  },
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
  // 悬浮窗控制
  hideFloatingWindow: () => ipcRenderer.send('floating-window-hide'),
  showFloatingWindow: () => ipcRenderer.send('floating-window-show'),
  toggleFloatingWindow: () => ipcRenderer.send('floating-window-toggle'),
  notifyDataUpdated: () => ipcRenderer.send('floating-window-data-updated'),
  onDataUpdated: (callback: () => void) => {
    ipcRenderer.on('data-updated', callback)
  },
  // 快捷键管理
  updateFloatingShortcut: (shortcut: string) => ipcRenderer.send('update-floating-shortcut', shortcut),
  getFloatingShortcut: () => ipcRenderer.invoke('get-floating-shortcut'),
  // 更新检查
  checkForUpdate: () => ipcRenderer.invoke('check-for-update'),
  openDownloadPage: (url: string) => ipcRenderer.send('open-download-page', url),
  onUpdateAvailable: (callback: (updateInfo: any) => void) => {
    ipcRenderer.on('update-available', (_, updateInfo) => callback(updateInfo))
  },
})

// 类型声明
export interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  getWindowState: () => Promise<{ isMaximized: boolean }>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
  openExternal: (url: string) => void
  hideFloatingWindow: () => void
  showFloatingWindow: () => void
  toggleFloatingWindow: () => void
  notifyDataUpdated: () => void
  onDataUpdated: (callback: () => void) => void
  updateFloatingShortcut: (shortcut: string) => void
  getFloatingShortcut: () => Promise<string>
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
