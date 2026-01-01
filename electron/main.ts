import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, clipboard } from 'electron'
import path from 'path'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let floatingWindow: BrowserWindow | null = null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.ico'),
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })
}

function createFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.show()
    return
  }

  floatingWindow = new BrowserWindow({
    width: 350,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    floatingWindow.loadURL(`${VITE_DEV_SERVER_URL}#/floating`)
  } else {
    floatingWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/floating' })
  }

  floatingWindow.on('closed', () => {
    floatingWindow = null
  })
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../public/icon.ico'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '打开主界面', 
      click: () => mainWindow?.show() 
    },
    { 
      label: '悬浮窗', 
      click: () => createFloatingWindow() 
    },
    {
      label: '划词翻译',
      click: () => triggerClipboardTranslation()
    },
    { type: 'separator' },
    { 
      label: '退出', 
      click: () => {
        mainWindow?.destroy()
        floatingWindow?.destroy()
        app.quit()
      } 
    }
  ])
  
  tray.setToolTip('Muse 英语学习助手')
  tray.setContextMenu(contextMenu)
  
  tray.on('double-click', () => {
    mainWindow?.show()
  })
}

// 触发剪贴板翻译
function triggerClipboardTranslation() {
  const text = clipboard.readText()
  if (text && text.trim()) {
    // 确保主窗口可见
    if (!mainWindow?.isVisible()) {
      mainWindow?.show()
    }
    // 发送剪贴板内容到渲染进程
    mainWindow?.webContents.send('clipboard-translate', text.trim())
  }
}

app.whenReady().then(() => {
  createWindow()
  createTray()
  
  // 全局快捷键：Ctrl+Shift+M 显示/隐藏主窗口
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })

  // 全局快捷键：Ctrl+Shift+T 划词翻译
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    triggerClipboardTranslation()
  })
})

// IPC 通信处理
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.hide())
ipcMain.on('open-floating', () => createFloatingWindow())
ipcMain.on('close-floating', () => floatingWindow?.close())

ipcMain.handle('get-window-state', () => ({
  isMaximized: mainWindow?.isMaximized() ?? false,
}))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
