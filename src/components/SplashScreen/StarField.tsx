/**
 * 星尘汇聚开屏动画
 * "Muse" - 知识的宇宙
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundEffects } from '../../utils/soundEffects'

// ==================== 类型定义 ====================

interface Star {
  id: string
  x: number // 当前X位置
  y: number // 当前Y位置
  originX: number // 原始X位置
  originY: number // 原始Y位置
  targetX?: number // 目标X位置（Muse字形）
  targetY?: number // 目标Y位置
  vx: number // X轴速度
  vy: number // Y轴速度
  color: string // 颜色
  size: number // 大小 1-3px
  twinkleSpeed: number // 闪烁速度
  twinklePhase: number // 闪烁相位
  opacity: number // 当前透明度
}

type Phase = 'loading' | 'converging' | 'ready' | 'exploding'

interface StarFieldProps {
  isReady: boolean // 加载是否完成
  onEnter: () => void // 进入应用回调
}

// ==================== 配置 ====================

const CONFIG = {
  STAR_COUNT: 200,
  MOUSE_RADIUS: 100,
  MOUSE_FORCE: 15, // 躲避力度
  RETURN_SPEED: 0.08, // 回归原位速度
  CONVERGE_DELAY: 2000, // 汇聚延迟（毫秒）
  CONVERGE_DURATION: 1500, // 汇聚动画时长
  EXPLODE_DURATION: 1200, // 爆炸动画时长
  COLORS: {
    BLUE: ['#60a5fa', '#3b82f6', '#2563eb'], // blue-400/500/600
    PURPLE: ['#c084fc', '#a855f7', '#9333ea'], // purple-400/500/600
    PINK: ['#f472b6', '#ec4899', '#db2777'], // pink-400/500/600
  },
  COLOR_WEIGHTS: [0.6, 0.3, 0.1], // 蓝紫粉权重
}

// ==================== 工具函数 ====================

/**
 * 生成随机星星
 */
function generateStars(count: number, width: number, height: number): Star[] {
  const stars: Star[] = []

  for (let i = 0; i < count; i++) {
    // 根据权重选择颜色
    const colorType = Math.random()
    let colors = CONFIG.COLORS.BLUE
    if (colorType > CONFIG.COLOR_WEIGHTS[0] + CONFIG.COLOR_WEIGHTS[1]) {
      colors = CONFIG.COLORS.PINK
    } else if (colorType > CONFIG.COLOR_WEIGHTS[0]) {
      colors = CONFIG.COLORS.PURPLE
    }

    stars.push({
      id: `star-${i}`,
      x: Math.random() * width,
      y: Math.random() * height,
      originX: Math.random() * width,
      originY: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5, // 轻微漂浮速度
      vy: (Math.random() - 0.5) * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 2 + 1, // 1-3px
      twinkleSpeed: Math.random() * 0.05 + 0.02,
      twinklePhase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.5,
    })
  }

  return stars
}

/**
 * 计算距离
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/**
 * 缓动函数 - easeOutCubic
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

// ==================== 组件 ====================

export default function StarFieldSplashScreen({ isReady, onEnter }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const phaseRef = useRef<Phase>('loading')
  const animationRef = useRef<number>()
  const convergeStartTimeRef = useRef<number>(0)
  const lastSoundTimeRef = useRef<number>(0)
  const [showEnter, setShowEnter] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)

  // 生成Muse字形坐标
  const generateMuseCoordinates = useCallback((width: number, height: number) => {
    // 创建临时Canvas来渲染Muse文字
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return []

    tempCanvas.width = width
    tempCanvas.height = height

    // 渲染"Muse"文字
    const fontSize = Math.min(width * 0.15, 150)
    tempCtx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    tempCtx.textAlign = 'center'
    tempCtx.textBaseline = 'middle'
    tempCtx.fillStyle = 'white'
    tempCtx.fillText('Muse', width / 2, height / 2)

    // 获取像素数据
    const imageData = tempCtx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    const coordinates: Array<[number, number]> = []

    // 采样步长（根据星星数量调整）
    const step = Math.ceil((width * height) / CONFIG.STAR_COUNT / 10)

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4
        const alpha = pixels[index + 3]

        if (alpha > 128) {
          coordinates.push([x, y])
        }
      }
    }

    // 随机打乱并截取所需数量
    const shuffled = coordinates.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, CONFIG.STAR_COUNT)
  }, [])

  // 更新星星位置
  const updateStars = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    timestamp: number
  ) => {
    const stars = starsRef.current
    const phase = phaseRef.current
    const mouse = mouseRef.current

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 根据阶段更新星星
    if (phase === 'loading' || phase === 'ready') {
      // 阶段1：星星散落 + 躲避鼠标（ready阶段也保持交互）
      const mx = mouse.x
      const my = mouse.y
      const radiusSquared = CONFIG.MOUSE_RADIUS * CONFIG.MOUSE_RADIUS

      stars.forEach((star) => {
        // 计算与鼠标的距离（使用距离平方避免开方运算）
        const dx = star.x - mx
        const dy = star.y - my
        const distSquared = dx * dx + dy * dy

        if (distSquared < radiusSquared) {
          // 躲避鼠标（使用缓存的距离）
          const dist = Math.sqrt(distSquared)
          const force = (1 - dist / CONFIG.MOUSE_RADIUS) * CONFIG.MOUSE_FORCE
          // 预计算cos和sin以提高性能
          const invDist = 1 / (dist + 0.1) // 避免除以0
          const cosAngle = dx * invDist
          const sinAngle = dy * invDist
          star.vx += cosAngle * force * 0.15
          star.vy += sinAngle * force * 0.15

          // 躲避时播放音效（限流，避免太频繁）
          const now = Date.now()
          if (force > 5 && now - lastSoundTimeRef.current > 100) {
            soundEffects.play('twinkle')
            lastSoundTimeRef.current = now
          }
        }

        // 回归原位（增强回归速度）
        const originDx = star.originX - star.x
        const originDy = star.originY - star.y
        star.vx += originDx * CONFIG.RETURN_SPEED * 0.05
        star.vy += originDy * CONFIG.RETURN_SPEED * 0.05

        // 应用速度并添加阻尼
        star.x += star.vx
        star.y += star.vy
        star.vx *= 0.92
        star.vy *= 0.92

        // 更新闪烁
        star.twinklePhase += star.twinkleSpeed
        star.opacity = 0.5 + Math.sin(star.twinklePhase) * 0.5
      })
    } else if (phase === 'converging') {
      // 阶段2：星辰汇聚
      const elapsed = timestamp - convergeStartTimeRef.current
      const progress = Math.min(elapsed / CONFIG.CONVERGE_DURATION, 1)
      const easedProgress = easeOutCubic(progress)

      stars.forEach((star) => {
        if (star.targetX !== undefined && star.targetY !== undefined) {
          // 向目标位置移动
          const dx = star.targetX - star.x
          const dy = star.targetY - star.y
          star.x += dx * 0.1 * easedProgress
          star.y += dy * 0.1 * easedProgress

          // 更新originX/Y，让星星记住汇聚后的位置
          if (progress >= 1) {
            star.originX = star.targetX
            star.originY = star.targetY
          }
        }

        // 汇聚时也保持闪烁
        star.twinklePhase += star.twinkleSpeed
        star.opacity = 0.5 + Math.sin(star.twinklePhase) * 0.5
      })

      // 汇聚完成
      if (progress >= 1) {
        phaseRef.current = 'ready'
        soundEffects.play('converge') // 播放汇聚音效
        // 延迟显示UI，避免阻塞动画
        requestAnimationFrame(() => {
          setShowEnter(true)
        })
      }
    } else if (phase === 'exploding') {
      // 阶段4：爆炸进入
      const elapsed = timestamp - convergeStartTimeRef.current
      const progress = Math.min(elapsed / CONFIG.EXPLODE_DURATION, 1)

      // 星星向外爆炸
      const centerX = width / 2
      const centerY = height / 2

      stars.forEach((star) => {
        const angle = Math.atan2(star.y - centerY, star.x - centerX)
        const dist = distance(star.x, star.y, centerX, centerY)
        const newDist = dist + (1000 - dist) * progress * 0.1

        star.x = centerX + Math.cos(angle) * newDist
        star.y = centerY + Math.sin(angle) * newDist
        star.opacity = 1 - progress
      })

      // 动画完成（不再调用onEnter，已经在handleEnter中设置定时器）
      if (progress >= 1) {
        // 停止动画循环
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        return
      }
    }

    // 绘制星星
    stars.forEach((star) => {
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fillStyle = star.color
      ctx.globalAlpha = star.opacity
      ctx.fill()

      // 添加光晕效果
      if (star.size > 2) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        )
        gradient.addColorStop(0, star.color)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.globalAlpha = star.opacity * 0.3
        ctx.fill()
      }
    })

    ctx.globalAlpha = 1
  }, [onEnter])

  // 动画循环
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    updateStars(ctx, canvas.width, canvas.height, timestamp)
    animationRef.current = requestAnimationFrame(animate)
  }, [updateStars])

  // 初始化
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 预加载Logo图片
    const img = new Image()
    img.src = '/Muse.png'
    img.onload = () => setLogoLoaded(true)

    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      starsRef.current = generateStars(CONFIG.STAR_COUNT, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 启用音效
    soundEffects.setEnabled(true)

    // 开始动画循环
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      // 组件卸载时停止所有音效
      soundEffects.setEnabled(false)
    }
  }, [animate])

  // 鼠标移动事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 监听加载完成
  useEffect(() => {
    if (isReady && phaseRef.current === 'loading') {
      // 延迟2秒后开始汇聚
      const timer = setTimeout(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // 生成Muse字形坐标
        const coordinates = generateMuseCoordinates(canvas.width, canvas.height)

        // 分配坐标给星星
        starsRef.current.forEach((star, index) => {
          if (index < coordinates.length) {
            star.targetX = coordinates[index][0]
            star.targetY = coordinates[index][1]
          }
        })

        phaseRef.current = 'converging'
        convergeStartTimeRef.current = performance.now()
      }, CONFIG.CONVERGE_DELAY)

      return () => clearTimeout(timer)
    }
  }, [isReady, generateMuseCoordinates])

  // 点击进入
  const handleEnter = useCallback(() => {
    if (phaseRef.current !== 'ready') return

    setIsExiting(true)
    phaseRef.current = 'exploding'
    convergeStartTimeRef.current = performance.now()
    soundEffects.play('enter') // 播放进入音效

    // 爆炸动画完成后才真正进入
    setTimeout(() => {
      onEnter()
    }, CONFIG.EXPLODE_DURATION)
  }, [onEnter])

  // 加载文字
  const loadingMessages = [
    '正在收集知识的星辰...',
    '正在构建记忆的星系...',
    '正在点亮智慧的星空...',
    '正在开启学习之旅...',
  ]

  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (phaseRef.current === 'loading') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #020617, #172554, #3b0764)',
        // 提示浏览器优化渲染
        contain: 'layout style paint',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.2,
        transition: { duration: CONFIG.EXPLODE_DURATION / 1000 },
      }}
    >
      {/* Canvas层 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          // Canvas层不受React渲染影响
          willChange: 'transform',
        }}
      />

      {/* 背景光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 加载文字（仅在loading阶段显示） */}
      {phaseRef.current === 'loading' && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.p
            key={messageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-medium text-blue-200"
            style={{
              textShadow: '0 0 20px rgba(96, 165, 250, 0.5)',
            }}
          >
            {loadingMessages[messageIndex]}
          </motion.p>
        </motion.div>
      )}

      {/* 进入按钮（仅在ready阶段显示） */}
      <AnimatePresence>
        {showEnter && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Logo显示 */}
            {logoLoaded && (
              <motion.div
                className="mb-12"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                  ease: 'easeOut',
                }}
                style={{ willChange: 'transform, opacity' }}
              >
                <img
                  src="/Muse.png"
                  alt="Muse Logo"
                  className="w-32 h-32 object-contain rounded-2xl"
                  style={{
                    filter: 'drop-shadow(0 8px 16px rgba(168, 85, 247, 0.4)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                    boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)',
                  }}
                  loading="eager"
                />
              </motion.div>
            )}

            {/* 按钮容器 - 启用指针事件 */}
            <div className="pointer-events-auto">
              <motion.button
                onClick={handleEnter}
                disabled={isExiting}
                className="relative px-12 py-4 rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  willChange: 'transform',
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {/* 按钮光晕 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                />

                {/* 按钮文字 */}
                <div className="relative flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">
                    ✨ 进入 Muse ✨
                  </span>
                </div>

                {/* 持续发光效果（不是hover触发） */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.button>
            </div>

            {/* 副标题 */}
            <motion.p
              className="mt-6 text-sm font-medium text-purple-300/80 tracking-widest uppercase"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              style={{ willChange: 'transform, opacity' }}
            >
              汇聚知识的宇宙
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部装饰线 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}
