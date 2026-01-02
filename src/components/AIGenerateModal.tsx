import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { aiService } from '../services/ai';
import { useAppStore } from '../store';
import { Word } from '../types';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookName: string;
}

export default function AIGenerateModal({ isOpen, onClose, bookId, bookName }: AIGenerateModalProps) {
  const { batchAddWordsToBook } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWords, setGeneratedWords] = useState<Partial<Word>[]>([]);
  const [status, setStatus] = useState<'idle' | 'generating' | 'preview' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(aiService.isConfigured());
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setStatus('generating');
    setError('');
    
    try {
      const words = await aiService.generateWords(prompt, count);
      if (words && words.length > 0) {
        setGeneratedWords(words);
        setStatus('preview');
      } else {
        setError('AI 未能生成单词，请尝试更换描述或检查 AI 配置。');
        setStatus('error');
      }
    } catch (err) {
      setError('生成过程中出错，请稍后再试。');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWords = async () => {
    setIsLoading(true);
    try {
      const wordsToAdd: Word[] = generatedWords.map(w => ({
        ...w,
        id: `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phonetic: w.phonetic || { us: '', uk: '' },
        meanings: w.meanings || [],
        examples: w.examples || [],
        synonyms: w.synonyms || [],
        antonyms: w.antonyms || [],
        collocations: w.collocations || [],
        frequency: w.frequency || 'medium',
        tags: ['ai-generated'],
      } as Word));

      await batchAddWordsToBook(bookId, wordsToAdd);
      setStatus('success');
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    } catch (err) {
      setError('添加单词到词库失败。');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setPrompt('');
    setCount(10);
    setGeneratedWords([]);
    setStatus('idle');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">AI 智能生成单词</h3>
              <p className="text-xs text-gray-500">添加到: {bookName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {!isConfigured ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">AI 未配置</h4>
              <p className="text-gray-500 mb-6">请先在设置页面配置 AI 模型 API Key。</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                去配置
              </button>
            </div>
          ) : (
            <>
              {status === 'idle' || status === 'generating' || status === 'error' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      描述你想要生成的单词主题或场景
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="例如：关于环境保护的常用词汇、雅思高频词汇、职场商务英语..."
                      className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">生成数量</span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCount(Math.max(1, count - 5))}
                        className="p-1 hover:bg-gray-100 rounded-md"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-bold text-blue-600 w-8 text-center">{count}</span>
                      <button
                        onClick={() => setCount(Math.min(50, count + 5))}
                        className="p-1 hover:bg-gray-100 rounded-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        正在生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        开始生成
                      </>
                    )}
                  </button>
                </div>
              ) : status === 'preview' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700">预览生成的单词 ({generatedWords.length})</h4>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      重新生成
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                    {generatedWords.map((w, i) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-800">{w.word}</span>
                          <span className="ml-2 text-xs text-gray-400">{w.phonetic?.us}</span>
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {w.meanings?.[0]?.translation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddWords}
                    disabled={isLoading}
                    className="w-full py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    确认加入词库
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-gray-800">添加成功！</h4>
                  <p className="text-gray-500">单词已成功加入到 {bookName}</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
