import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openFloating: () => ipcRenderer.send('open-floating'),
  closeFloating: () => ipcRenderer.send('close-floating'),
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('maximize-change', (_, isMaximized) => callback(isMaximized))
  },
  // 剪贴板翻译相关
  onClipboardTranslate: (callback: (event: any, text: string) => void) => {
    ipcRenderer.on('clipboard-translate', callback)
  },
  removeClipboardTranslateListener: () => {
    ipcRenderer.removeAllListeners('clipboard-translate')
  },
})

export {}
