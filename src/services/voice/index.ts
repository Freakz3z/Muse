export class WebSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  play(word: string, pronunciation: 'us' | 'uk'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 取消当前正在播放的音频
        this.cancel();

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = pronunciation === 'us' ? 'en-US' : 'en-GB';
        utterance.rate = 0.9;

        // 尝试获取高质量的语音
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
          voice.lang.startsWith(pronunciation === 'us' ? 'en-US' : 'en-GB') &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event);

        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  cancel(): void {
    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }
}

// 导出单例实例
export const voiceService = new WebSpeechService();
