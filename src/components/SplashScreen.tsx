import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [loadingText, setLoadingText] = useState('正在初始化 AI 引擎...');
  const messages = [
    '正在初始化 AI 引擎...',
    '加载个性化词库...',
    '同步学习进度...',
    '准备智能练习...',
    '开启高效学习之旅...'
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const titleLetters = "Muse".split("");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 多层动态背景光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主光晕 - 蓝色 */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* 主光晕 - 紫色 */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* 主光晕 - 粉色 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 星空粒子效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 1, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* 流光效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"
            style={{
              left: `${20 + i * 30}%`,
            }}
            animate={{
              x: [0, 100, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo 容器 - 整体浮动动画 + 光晕效果 */}
        <motion.div
          className="relative mb-12"
          initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: 0,
            y: [0, -12, 0],
          }}
          transition={{
            scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 1 },
            rotate: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {/* Logo 外发光效果 */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #a855f7, #ec4899)',
              filter: 'blur(20px)',
              opacity: 0.5,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Logo 边框光效 */}
          <motion.div
            className="absolute -inset-1 rounded-3xl opacity-50"
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #a855f7, #ec4899, #3b82f6)',
              backgroundSize: '300% 300%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Logo 主体 */}
          <img
            src="/Muse.png"
            alt="Muse Logo"
            className="relative w-36 h-36 object-contain rounded-3xl"
          />
        </motion.div>

        {/* 标题文字 - 逐字动画 + 渐变效果 */}
        <div className="flex gap-2 mb-4 px-8">
          {titleLetters.map((letter, i) => (
            <motion.span
              key={i}
              className="text-6xl font-black tracking-wider inline-block"
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ y: 60, opacity: 0, rotateX: -90 }}
              animate={{
                y: 0,
                opacity: 1,
                rotateX: 0,
              }}
              transition={{
                delay: 0.6 + i * 0.12,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-col items-center"
        >
          {/* 副标题 */}
          <motion.p
            className="text-sm font-bold tracking-[0.4em] uppercase mb-10"
            style={{
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            AI Powered Learning
          </motion.p>

          {/* 进度条容器 */}
          <div className="relative w-72 h-[3px] bg-white/5 rounded-full overflow-hidden mb-6 backdrop-blur-sm">
            {/* 进度条背景光效 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* 主进度条 */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 w-full"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* 动态提示文字 */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-xs text-blue-300/80 font-medium tracking-wide"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

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
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
