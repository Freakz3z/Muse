import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import https from 'https'

let mainWindow: BrowserWindow | null = null
let floatingWindow: BrowserWindow | null = null
let tray: Tray | null = null
let currentFloatingShortcut = 'Alt+X' // 默认快捷键

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const isDev = !!VITE_DEV_SERVER_URL

// 简单的日志工具（Electron 主进程）
const log = {
  log: (...args: any[]) => isDev && console.log('[Main]', ...args),
  error: (...args: any[]) => console.error('[Main]', ...args),
}

// GitHub 仓库信息
const GITHUB_REPO = 'Freakz3z/Muse'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`

/**
 * 从 GitHub Releases API 获取最新版本信息
 */
function fetchLatestRelease(): Promise<{ version: string; downloadUrl: string; notes: string } | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'Muse-App',
      },
    }

    https.get(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const release = JSON.parse(data)
          const version = release.tag_name.replace(/^v/, '') // 移除 v 前缀
          const downloadUrl = release.html_url
          const notes = release.body || ''

          log.log('获取到最新版本:', version)
          resolve({ version, downloadUrl, notes })
        } catch (error) {
          log.error('解析版本信息失败:', error)
          resolve(null)
        }
      })
    }).on('error', (error) => {
      log.error('获取版本信息失败:', error)
      resolve(null)
    })
  })
}

/**
 * 比较版本号
 * 返回 true 如果 latestVersion > currentVersion
 */
function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  const current = currentVersion.split('.').map(Number)
  const latest = latestVersion.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    const c = current[i] || 0
    const l = latest[i] || 0
    if (l > c) return true
    if (l < c) return false
  }
  return false
}

/**
 * 检查更新
 */
async function checkForUpdate(): Promise<{
  hasUpdate: boolean
  currentVersion: string
  latestVersion?: string
  downloadUrl?: string
  notes?: string
}> {
  const currentVersion = app.getVersion()
  log.log('当前版本:', currentVersion)

  const release = await fetchLatestRelease()

  if (!release) {
    return { hasUpdate: false, currentVersion }
  }

  const hasUpdate = isNewerVersion(currentVersion, release.version)

  return {
    hasUpdate,
    currentVersion,
    latestVersion: release.version,
    downloadUrl: release.downloadUrl,
    notes: release.notes,
  }
}

// 获取图标路径，兼容开发和生产环境
function getIconPath() {
  if (app.isPackaged) {
    // 生产环境：图标文件在 resources 目录
    return path.join(process.resourcesPath, 'Muse.ico')
  } else {
    // 开发环境：图标文件在 public 目录
    return path.join(__dirname, '../public/Muse.ico')
  }
}

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
      // 添加内容安全策略
      webSecurity: true,
    },
    icon: getIconPath(),
    show: false, // 先不显示，等加载完再显示
  })

  // 设置 CSP 头（根据环境调整）
  const isDev = !!VITE_DEV_SERVER_URL
  mainWindow.webContents.session.webRequest.onHeadersReceived((details: any, callback: any) => {
    // 开发环境需要 unsafe-eval 支持 Vite HMR
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
      : "script-src 'self' 'unsafe-inline';"

    // 允许连接到外部 API（AI 服务、词典 API 等）
    const connectSrc = isDev
      ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"
      : "connect-src 'self' https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          scriptSrc,
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob:;",
          "font-src 'self' data:;",
          connectSrc,
          "media-src 'self' blob:;",
          "object-src 'none';",
          "base-uri 'self';",
          "form-action 'self';",
          "frame-ancestors 'none';",
          "block-all-mixed-content;",
        ].join(' ')
      }
    })
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 窗口准备好后显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })
}

function createTray() {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)

  // 确保图标不为空
  if (icon.isEmpty()) {
    console.error('Failed to load tray icon from:', iconPath)
  }

  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: () => mainWindow?.show()
    },
    {
      label: '悬浮查词',
      click: () => toggleFloatingWindow()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        mainWindow?.destroy()
        app.quit()
      }
    }
  ])

  tray.setToolTip('Muse')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
  })
}

function createFloatingWindow() {
  if (floatingWindow) {
    floatingWindow.show()
    floatingWindow.focus()
    return
  }

  floatingWindow = new BrowserWindow({
    width: 450,
    height: 650,
    minWidth: 350,
    minHeight: 400,
    maxWidth: 800,
    maxHeight: 900,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    icon: getIconPath(),
    show: false,
  })

  // 设置 CSP 头
  const isDev = !!VITE_DEV_SERVER_URL
  floatingWindow.webContents.session.webRequest.onHeadersReceived((details: any, callback: any) => {
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
      : "script-src 'self' 'unsafe-inline';"

    // 允许连接到外部 API（AI 服务、词典 API 等）
    const connectSrc = isDev
      ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"
      : "connect-src 'self' https://api.openai.com https://dashscope.aliyuncs.com https://*.openai.com https://*.aliyuncs.com;"

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          scriptSrc,
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' data: blob:;",
          "font-src 'self' data:;",
          connectSrc,
          "media-src 'self' blob:;",
          "object-src 'none';",
        ].join(' ')
      }
    })
  })

  if (VITE_DEV_SERVER_URL) {
    floatingWindow.loadURL(`${VITE_DEV_SERVER_URL}#/floating`)
    // floatingWindow.webContents.openDevTools()
  } else {
    floatingWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'floating'
    })
  }

  floatingWindow.once('ready-to-show', () => {
    floatingWindow?.show()
  })

  floatingWindow.on('close', (event) => {
    event.preventDefault()
    floatingWindow?.hide()
  })
}

function toggleFloatingWindow() {
  if (floatingWindow?.isVisible()) {
    floatingWindow.hide()
  } else {
    if (!floatingWindow) {
      createFloatingWindow()
    } else {
      floatingWindow.show()
      floatingWindow.focus()
    }
  }
}

// 注册悬浮窗快捷键
function registerFloatingShortcut(shortcut: string) {
  // 先注销旧的快捷键
  if (currentFloatingShortcut) {
    globalShortcut.unregister(currentFloatingShortcut)
  }

  // 注册新的快捷键
  const success = globalShortcut.register(shortcut, () => {
    toggleFloatingWindow()
  })

  if (success) {
    currentFloatingShortcut = shortcut
    log.log(`悬浮窗快捷键已注册: ${shortcut}`)
  } else {
    log.error(`注册悬浮窗快捷键失败: ${shortcut}`)
    // 恢复默认快捷键
    globalShortcut.register('Alt+X', () => toggleFloatingWindow())
    currentFloatingShortcut = 'Alt+X'
  }

  return success
}

// 获取当前快捷键
function getCurrentFloatingShortcut() {
  return currentFloatingShortcut
}

// 防止应用多开
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果获取锁失败，说明已经有一个实例在运行，退出当前实例
  app.quit()
} else {
  // 当第二个实例尝试启动时，聚焦到第一个实例的窗口
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

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

    // 注册默认的悬浮窗快捷键
    registerFloatingShortcut('Alt+X')

    // 启动时检查更新（静默检查，不阻塞启动）
    setTimeout(async () => {
      const updateInfo = await checkForUpdate()
      if (updateInfo.hasUpdate && mainWindow) {
        // 发送更新通知到渲染进程
        mainWindow.webContents.send('update-available', updateInfo)
        log.log('发现新版本:', updateInfo.latestVersion)
      }
    }, 3000) // 延迟3秒，避免影响启动速度
  })
}

// IPC 通信处理
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.hide())

ipcMain.handle('get-window-state', () => ({
  isMaximized: mainWindow?.isMaximized() ?? false,
}))

// 悬浮窗相关 IPC
ipcMain.on('floating-window-toggle', () => toggleFloatingWindow())
ipcMain.on('floating-window-show', () => {
  if (!floatingWindow) {
    createFloatingWindow()
  } else {
    floatingWindow.show()
    floatingWindow.focus()
  }
})
ipcMain.on('floating-window-hide', () => floatingWindow?.hide())

// 数据更新通知 - 当悬浮窗添加单词后通知主窗口
ipcMain.on('floating-window-data-updated', () => {
  // 向主窗口发送重新加载数据的信号
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('data-updated')
  }
})

// 在默认浏览器中打开外部链接
ipcMain.on('open-external', (_, url: string) => {
  shell.openExternal(url)
})

// 更新悬浮窗快捷键
ipcMain.on('update-floating-shortcut', (_, shortcut: string) => {
  registerFloatingShortcut(shortcut)
})

// 获取当前悬浮窗快捷键
ipcMain.handle('get-floating-shortcut', () => {
  return getCurrentFloatingShortcut()
})

// 检查更新
ipcMain.handle('check-for-update', async () => {
  const updateInfo = await checkForUpdate()
  return updateInfo
})

// 打开下载页面
ipcMain.on('open-download-page', (_, url: string) => {
  shell.openExternal(url)
})

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
