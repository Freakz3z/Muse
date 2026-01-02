import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Globe, BookOpen } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* 动态背景粒子 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{ 
              y: [null, "-100%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* 背景光晕 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo 容器 */}
        <motion.div
          className="relative mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 外层旋转光环 */}
          <svg className="absolute -inset-8 w-[calc(100%+64px)] h-[calc(100%+64px)] -rotate-90">
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="100 300"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Logo 主体 */}
          <div className="relative w-28 h-28 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.img 
              src="/Muse.png" 
              alt="Muse Logo" 
              className="w-16 h-16 object-contain relative z-10"
              animate={{ 
                y: [0, -5, 0],
                filter: ["drop-shadow(0 0 0px rgba(59,130,246,0))", "drop-shadow(0 0 15px rgba(59,130,246,0.5))", "drop-shadow(0 0 0px rgba(59,130,246,0))"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* 漂浮的小图标 */}
          <FloatingIcon Icon={Brain} delay={0} x={-60} y={-40} size={20} color="text-blue-400" />
          <FloatingIcon Icon={Zap} delay={0.5} x={70} y={-20} size={18} color="text-yellow-400" />
          <FloatingIcon Icon={Globe} delay={1} x={-50} y={60} size={16} color="text-purple-400" />
          <FloatingIcon Icon={BookOpen} delay={1.5} x={60} y={50} size={18} color="text-green-400" />
        </motion.div>

        {/* 标题文字 - 逐字动画 */}
        <div className="flex gap-1 mb-4">
          {titleLetters.map((letter, i) => (
            <motion.span
              key={i}
              className="text-5xl font-black text-white tracking-tighter"
              initial={{ y: 40, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ 
                delay: 0.5 + i * 0.1, 
                duration: 0.8, 
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
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center"
        >
          <p className="text-blue-400/80 text-xs font-bold tracking-[0.3em] uppercase mb-8">
            AI Powered Learning
          </p>

          {/* 极简进度条 */}
          <div className="relative w-64 h-[2px] bg-white/5 rounded-full overflow-hidden mb-4">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 w-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>

          {/* 动态提示文字 */}
          <div className="h-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingText}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] text-gray-500 font-medium"
              >
                {loadingText}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FloatingIcon({ Icon, delay, x, y, size, color }: any) {
  return (
    <motion.div
      className={`absolute ${color} opacity-40`}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{ 
        x, 
        y: [y, y - 10, y],
        opacity: 0.4,
        scale: 1
      }}
      transition={{ 
        delay,
        duration: 3,
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

