/**
 * 个性化内容生成器测试页面
 *
 * 用于测试PersonalizedContentGenerator的三大功能:
 * 1. 动态例句生成
 * 2. 个性化记忆技巧
 * 3. 难度自适应释义
 */

import { useState } from 'react';
import {
  Brain,
  BookOpen,
  Lightbulb,
  Sparkles,
  Play,
  RotateCcw,
  FileText,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';
import { personalizedContentGenerator } from '../services/ai-core';
import type { ContentGenerationRequest } from '../types/personalized-content';
import { createDefaultProfile } from '../types/learner-profile';

// 测试单词
const testWords = [
  { id: '1', word: 'serendipity', definition: '意外发现珍奇事物的本领' },
  { id: '2', word: 'eloquent', definition: '雄辩的,有口才的' },
  { id: '3', word: 'ephemeral', definition: '短暂的,瞬息的' },
  { id: '4', word: 'resilient', definition: '有弹性的,能复原的' },
  { id: '5', word: 'pragmatic', definition: '务实的,实用的' },
];

export default function TestContentGenerator() {
  const [selectedWord, setSelectedWord] = useState(testWords[0]);
  const [cognitiveStyle, setCognitiveStyle] = useState<'visual' | 'verbal' | 'contextual'>('visual');
  const [vocabularySize, setVocabularySize] = useState(500);
  const [contentType, setContentType] = useState<'example' | 'memoryTip' | 'explanation'>('example');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 创建测试用的用户画像
  const createTestProfile = () => {
    const profile = createDefaultProfile('test-user');

    // 设置认知风格
    profile.cognitiveStyle.visualLearner = cognitiveStyle === 'visual' ? 0.8 : 0.3;
    profile.cognitiveStyle.verbalLearner = cognitiveStyle === 'verbal' ? 0.8 : 0.3;
    profile.cognitiveStyle.contextualLearner = cognitiveStyle === 'contextual' ? 0.8 : 0.3;

    // 设置词汇量
    profile.knowledgeGraph.vocabularySize = vocabularySize;

    return profile;
  };

  // 生成内容
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: ContentGenerationRequest = {
        wordId: selectedWord.id,
        word: selectedWord.word,
        definition: selectedWord.definition,
        profile: createTestProfile(),
        contentType,
      };

      let content;
      switch (contentType) {
        case 'example':
          content = await personalizedContentGenerator.generateExample(request);
          break;
        case 'memoryTip':
          content = await personalizedContentGenerator.generateMemoryTip(request);
          break;
        case 'explanation':
          content = await personalizedContentGenerator.generateExplanation(request);
          break;
      }

      setResult(content);
    } catch (err: any) {
      setError(err.message || '生成失败');
      console.error('内容生成错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  // 获取内容类型图标和标题
  const getContentTypeInfo = () => {
    switch (contentType) {
      case 'example':
        return {
          icon: <MessageSquare className="w-5 h-5" />,
          title: '动态例句生成',
          description: '根据认知风格生成个性化例句',
        };
      case 'memoryTip':
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          title: '记忆技巧生成',
          description: 'AI生成的科学记忆方法',
        };
      case 'explanation':
        return {
          icon: <BookOpen className="w-5 h-5" />,
          title: '难度自适应释义',
          description: '根据词汇量生成的个性化释义',
        };
    }
  };

  const contentTypeInfo = getContentTypeInfo();
  const cacheStats = personalizedContentGenerator.getCacheStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">个性化内容生成器测试</h1>
          </div>
          <p className="text-gray-600">测试AI驱动的个性化学习内容生成</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧: 控制面板 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 内容类型选择 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                内容类型
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setContentType('example')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    contentType === 'example'
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">动态例句</span>
                  </div>
                </button>
                <button
                  onClick={() => setContentType('memoryTip')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    contentType === 'memoryTip'
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">记忆技巧</span>
                  </div>
                </button>
                <button
                  onClick={() => setContentType('explanation')}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    contentType === 'explanation'
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">难度释义</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 测试参数 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                测试参数
              </h3>

              {/* 单词选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">选择单词</label>
                <select
                  value={selectedWord.id}
                  onChange={(e) => {
                    const word = testWords.find(w => w.id === e.target.value);
                    if (word) setSelectedWord(word);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {testWords.map(word => (
                    <option key={word.id} value={word.id}>
                      {word.word} - {word.definition}
                    </option>
                  ))}
                </select>
              </div>

              {/* 认知风格 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">认知风格</label>
                <select
                  value={cognitiveStyle}
                  onChange={(e) => setCognitiveStyle(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="visual">视觉型学习者</option>
                  <option value="verbal">语言型学习者</option>
                  <option value="contextual">情境型学习者</option>
                </select>
              </div>

              {/* 词汇量 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  词汇量: {vocabularySize}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={vocabularySize}
                  onChange={(e) => setVocabularySize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>初学者</span>
                  <span>中级</span>
                  <span>高级</span>
                </div>
              </div>
            </div>

            {/* 缓存统计 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                缓存统计
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">缓存项数:</span>
                  <span className="font-semibold text-gray-800">{cacheStats.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">命中次数:</span>
                  <span className="font-semibold text-gray-800">{cacheStats.hitCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧: 结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 内容信息 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                {contentTypeInfo.icon}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{contentTypeInfo.title}</h2>
                  <p className="text-sm text-gray-600">{contentTypeInfo.description}</p>
                </div>
              </div>

              {/* 测试单词信息 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">{selectedWord.word}</div>
                  <div className="text-gray-600">{selectedWord.definition}</div>
                </div>
              </div>

              {/* 生成按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      生成内容
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
              </div>
            </div>

            {/* 生成结果 */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h3 className="text-red-800 font-semibold mb-2">生成失败</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  生成结果
                </h3>

                {/* 例句结果 */}
                {contentType === 'example' && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">英语例句</div>
                      <div className="text-lg text-gray-800 bg-gray-50 rounded-lg p-3">
                        {result.sentence}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">中文翻译</div>
                      <div className="text-gray-700">{result.translation}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">使用场景</div>
                      <div className="text-gray-700">{result.scenario}</div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                        难度: {result.difficulty}
                      </div>
                      <div className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">
                        风格: {result.style}
                      </div>
                    </div>
                  </div>
                )}

                {/* 记忆技巧结果 */}
                {contentType === 'memoryTip' && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">技巧类型</div>
                      <div className="text-lg font-semibold text-purple-700">
                        {result.technique === 'association' && '联想记忆法'}
                        {result.technique === 'wordRoot' && '词根词缀法'}
                        {result.technique === 'scene' && '场景记忆法'}
                        {result.technique === 'story' && '故事记忆法'}
                        {result.technique === 'mnemonic' && '助记符法'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">标题</div>
                      <div className="text-lg font-semibold text-gray-800">{result.title}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">详细说明</div>
                      <div className="text-gray-700 bg-gray-50 rounded-lg p-3">
                        {result.content}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        有效性: {(result.effectiveness * 100).toFixed(0)}%
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        预计时间: {result.estimatedTime}分钟
                      </div>
                    </div>
                  </div>
                )}

                {/* 释义结果 */}
                {contentType === 'explanation' && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">释义</div>
                      <div className="text-lg text-gray-800 bg-gray-50 rounded-lg p-3">
                        {result.definition}
                      </div>
                    </div>
                    {result.synonyms && result.synonyms.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">同义词</div>
                        <div className="flex flex-wrap gap-2">
                          {result.synonyms.map((synonym: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.antonyms && result.antonyms.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">反义词</div>
                        <div className="flex flex-wrap gap-2">
                          {result.antonyms.map((antonym: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                              {antonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.collocations && result.collocations.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">常用搭配</div>
                        <div className="flex flex-wrap gap-2">
                          {result.collocations.map((collocation: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              {collocation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm w-fit">
                      难度: {result.difficulty}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
