import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
}

export default function SplashScreen({}: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 背景装饰圆圈 */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, 30, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, -30, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo 图标动画 */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="relative w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <img src="/Muse.png" alt="Muse Logo" className="w-16 h-16 object-contain relative z-10" />
            
            {/* 环绕的粒子 */}
            <motion.div
              className="absolute w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <motion.div 
                className="absolute top-2 left-1/2 w-2 h-2 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
          
          {/* 闪烁的星星 */}
          <motion.div
            className="absolute -top-4 -right-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </motion.div>
        </motion.div>

        {/* 文字标题 */}
        <motion.div
          className="text-center z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2 tracking-tight">
            Muse
          </h1>
          <motion.p 
            className="text-gray-500 text-sm font-medium tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            AI Powered Learning
          </motion.p>
        </motion.div>

        {/* 加载进度条 */}
        <motion.div 
          className="mt-12 w-48 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 192 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 0.5
            }}
          />
        </motion.div>
        
        <motion.p
          className="mt-4 text-xs text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          正在初始化 AI 引擎...
        </motion.p>
      </div>
    </motion.div>
  );
}
