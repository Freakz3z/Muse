/**
 * 音效管理器
 * 使用Web Audio API生成音效，无需外部音频文件
 */

class SoundEffectManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // 检测浏览器支持
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
    }
  }

  /**
   * 播放音效
   */
  play(type: 'twinkle' | 'converge' | 'enter') {
    if (!this.enabled || !this.audioContext) return

    // 恢复AudioContext（某些浏览器需要用户交互后才能播放）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    switch (type) {
      case 'twinkle':
        this.playTwinkle()
        break
      case 'converge':
        this.playConverge()
        break
      case 'enter':
        this.playEnter()
        break
    }
  }

  /**
   * 星星闪烁音效
   * 高频短促的"叮"声
   */
  private playTwinkle() {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 随机频率，模拟不同星星的声音
    const frequency = 800 + Math.random() * 400
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = 'sine'

    // 音量包络
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  /**
   * 汇聚音效
   * 低频共鸣的"宇宙"声
   */
  private playConverge() {
    if (!this.audioContext) return

    const oscillator1 = this.audioContext.createOscillator()
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 双音调，创造和声效果
    oscillator1.frequency.setValueAtTime(200, this.audioContext.currentTime)
    oscillator2.frequency.setValueAtTime(300, this.audioContext.currentTime)
    oscillator1.type = 'sine'
    oscillator2.type = 'sine'

    // 音量包络
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5)

    oscillator1.start(this.audioContext.currentTime)
    oscillator2.start(this.audioContext.currentTime)
    oscillator1.stop(this.audioContext.currentTime + 1.5)
    oscillator2.stop(this.audioContext.currentTime + 1.5)
  }

  /**
   * 进入音效
   * 高频上升的"穿越"声
   */
  private playEnter() {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 频率上升，模拟穿越感
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.8)
    oscillator.type = 'sine'

    // 音量包络
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.2)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.8)
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * 获取音效状态
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

// 导出单例
export const soundEffects = new SoundEffectManager()
