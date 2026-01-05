import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * 全局错误边界组件
 * 捕获子组件树中的 JavaScript 错误，显示友好的错误界面
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 记录错误信息
    console.error('[ErrorBoundary] 捕获到错误:', error)
    console.error('[ErrorBoundary] 错误详情:', errorInfo)

    // 保存错误信息到 state
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = (): void => {
    window.location.hash = '/'
    this.handleReset()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            {/* 错误图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* 错误标题 */}
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              哎呀，出错了
            </h1>

            {/* 错误描述 */}
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              应用遇到了意外错误，请尝试刷新页面或返回首页
            </p>

            {/* 错误详情（仅开发环境） */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs font-semibold text-red-700 dark:text-red-400 cursor-pointer">
                      查看堆栈信息
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重新加载
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                返回首页
              </button>
            </div>

            {/* 帮助文本 */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
              如果问题持续存在，请联系技术支持
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
