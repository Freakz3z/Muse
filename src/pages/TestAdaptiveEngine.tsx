/**
 * AI自适应学习引擎测试页面
 *
 * 用于测试和对比AI自适应引擎与SM-2算法的效果
 */

import { useState, useEffect } from 'react';
import {
  Brain,
  BarChart3,
  Play,
  RotateCcw,
  Target,
} from 'lucide-react';
import { calculateAdaptiveNextReview, updateAdaptiveConfig, getAdaptiveConfig } from '../utils/spaced-repetition';
import { learningEventsStorage } from '../storage';
import type { AdaptiveReviewPlan } from '../services/ai-core/adaptive-learning-engine';
import { getProfileManager } from '../services/ai-core';

// 模拟学习场景
interface TestScenario {
  name: string;
  description: string;
  wordHistory: Array<{
    action: 'learn' | 'review' | 'quiz';
    result: 'correct' | 'incorrect' | 'partial';
    timestamp: number;
    timeTaken: number;
    confidence: number;
  }>;
}

// 测试场景定义
const testScenarios: TestScenario[] = [
  {
    name: '场景1：新单词首次学习',
    description: '用户第一次学习这个单词',
    wordHistory: [
      {
        action: 'learn',
        result: 'correct',
        timestamp: Date.now() - 1000 * 60 * 60, // 1小时前
        timeTaken: 3000,
        confidence: 0.7,
      },
    ],
  },
  {
    name: '场景2：连续3次正确',
    description: '用户已经连续3次正确回答',
    wordHistory: [
      {
        action: 'learn',
        result: 'correct',
        timestamp: Date.now() - 72 * 60 * 60 * 1000, // 3天前
        timeTaken: 2500,
        confidence: 0.8,
      },
      {
        action: 'review',
        result: 'correct',
        timestamp: Date.now() - 48 * 60 * 60 * 1000, // 2天前
        timeTaken: 2000,
        confidence: 0.85,
      },
      {
        action: 'review',
        result: 'correct',
        timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1天前
        timeTaken: 1500,
        confidence: 0.9,
      },
    ],
  },
  {
    name: '场景3：有错误的复习',
    description: '用户学习过程中有错误',
    wordHistory: [
      {
        action: 'learn',
        result: 'correct',
        timestamp: Date.now() - 72 * 60 * 60 * 1000,
        timeTaken: 3000,
        confidence: 0.7,
      },
      {
        action: 'review',
        result: 'incorrect',
        timestamp: Date.now() - 48 * 60 * 60 * 1000,
        timeTaken: 8000,
        confidence: 0.3,
      },
      {
        action: 'review',
        result: 'correct',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        timeTaken: 4000,
        confidence: 0.6,
      },
    ],
  },
  {
    name: '场景4：快速掌握（反应快）',
    description: '用户反应时间很短，掌握很好',
    wordHistory: [
      {
        action: 'learn',
        result: 'correct',
        timestamp: Date.now() - 72 * 60 * 60 * 1000,
        timeTaken: 1200,
        confidence: 0.9,
      },
      {
        action: 'review',
        result: 'correct',
        timestamp: Date.now() - 48 * 60 * 60 * 1000,
        timeTaken: 800,
        confidence: 0.95,
      },
      {
        action: 'review',
        result: 'correct',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        timeTaken: 600,
        confidence: 0.98,
      },
    ],
  },
];

export default function TestAdaptiveEngine() {
  const [testResults, setTestResults] = useState<Map<string, {
    ai: AdaptiveReviewPlan;
    sm2: AdaptiveReviewPlan;
    comparison: {
      intervalDiff: number;
      intervalRatio: number;
      winner: 'AI' | 'SM-2' | 'Tie';
    };
  }>>(new Map());

  const [isRunning, setIsRunning] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [eventCount, setEventCount] = useState(0);
  const [profileExists, setProfileExists] = useState(false);

  // 检查初始状态
  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    const config = getAdaptiveConfig();
    setAiEnabled(config.enableAI);

    const profileManager = getProfileManager();
    const profile = profileManager.getProfile();
    setProfileExists(!!profile);

    const count = await learningEventsStorage.getCount();
    setEventCount(count);
  };

  // 计算SM-2复习计划（用于对比）
  const calculateSM2Plan = (wordId: string, history: TestScenario['wordHistory']): AdaptiveReviewPlan => {
    const correctCount = history.filter(h => h.result === 'correct').length;

    // SM-2算法逻辑
    let interval = 24; // 默认1天

    if (correctCount >= 3) {
      interval = 24 * Math.pow(2, correctCount - 2);
    } else if (correctCount === 0) {
      interval = 4;
    }

    const nextReviewAt = Date.now() + (interval * 60 * 60 * 1000);

    return {
      wordId,
      nextReviewAt,
      interval: Math.round(interval),
      confidence: 0.6,
      reasoning: '使用SM-2算法（固定公式）',
      difficulty: correctCount >= 3 ? 'easy' : correctCount >= 1 ? 'medium' : 'hard',
      suggestedAction: '建议按计划复习',
    };
  };

  // 运行测试
  const runTest = async () => {
    setIsRunning(true);
    const results = new Map();

    for (const scenario of testScenarios) {
      const wordId = `test_${scenario.name}`;

      // 计算SM-2结果
      const sm2Plan = calculateSM2Plan(wordId, scenario.wordHistory);

      // 计算AI结果
      let aiPlan: AdaptiveReviewPlan;
      try {
        aiPlan = await calculateAdaptiveNextReview(wordId, scenario.wordHistory);
      } catch (error) {
        console.error('AI预测失败:', error);
        aiPlan = sm2Plan; // 使用SM-2作为fallback
      }

      // 对比结果
      const intervalDiff = aiPlan.interval - sm2Plan.interval;
      const intervalRatio = aiPlan.interval / sm2Plan.interval;
      let winner: 'AI' | 'SM-2' | 'Tie' = 'Tie';

      if (Math.abs(intervalDiff) > 1) {
        // 如果差异大于1小时，判断哪个更合理
        const avgTime = scenario.wordHistory.reduce((sum, h) => sum + h.timeTaken, 0) / scenario.wordHistory.length;
        const correctRate = scenario.wordHistory.filter(h => h.result === 'correct').length / scenario.wordHistory.length;

        // 反应快且正确率高 → 应该给予更长的间隔
        if (avgTime < 2000 && correctRate >= 0.8) {
          winner = aiPlan.interval > sm2Plan.interval ? 'AI' : 'SM-2';
        }
        // 反应慢或正确率低 → 应该缩短间隔
        else if (avgTime > 5000 || correctRate < 0.5) {
          winner = aiPlan.interval < sm2Plan.interval ? 'AI' : 'SM-2';
        }
      }

      results.set(scenario.name, {
        ai: aiPlan,
        sm2: sm2Plan,
        comparison: {
          intervalDiff,
          intervalRatio,
          winner,
        },
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  // 切换AI开关
  const toggleAI = () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    updateAdaptiveConfig({ enableAI: newState });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI自适应学习引擎测试</h1>
          <p className="text-gray-500 mt-1">对比AI预测与SM-2算法的效果差异</p>
        </div>
        <button
          onClick={checkInitialState}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          刷新状态
        </button>
      </div>

      {/* 系统状态 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border-2 ${aiEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${aiEnabled ? 'bg-green-500' : 'bg-gray-400'}`}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">AI引擎状态</p>
              <p className={`font-bold ${aiEnabled ? 'text-green-700' : 'text-gray-700'}`}>
                {aiEnabled ? '已启用' : '已禁用'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">学习事件总数</p>
              <p className="font-bold text-gray-800">{eventCount}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border-2 ${profileExists ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profileExists ? 'bg-purple-500' : 'bg-gray-400'}`}>
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">用户画像</p>
              <p className={`font-bold ${profileExists ? 'text-purple-700' : 'text-gray-700'}`}>
                {profileExists ? '已创建' : '未创建'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">测试控制</h2>
            <p className="text-gray-500 text-sm mt-1">运行预定义测试场景，对比AI与SM-2算法</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleAI}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                aiEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {aiEnabled ? 'AI已启用' : 'AI已禁用'}
            </button>
            <button
              onClick={runTest}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  运行测试
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 测试结果 */}
      {testResults.size > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">测试结果</h2>

          {Array.from(testResults.entries()).map(([scenarioName, result]) => (
            <div key={scenarioName} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{scenarioName}</h3>
                  <p className="text-gray-500 text-sm">{testScenarios.find(s => s.name === scenarioName)?.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.comparison.winner === 'AI' ? 'bg-green-100 text-green-700' :
                  result.comparison.winner === 'SM-2' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {result.comparison.winner === 'AI' ? '✨ AI更优' : result.comparison.winner === 'SM-2' ? '📐 SM-2更优' : '🤝 平局'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI结果 */}
                <div className={`p-4 rounded-xl border-2 ${result.comparison.winner === 'AI' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-gray-800">AI自适应引擎</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">复习间隔：</span>
                      <span className="font-bold text-gray-800">{result.ai.interval} 小时</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">置信度：</span>
                      <span className="font-bold text-gray-800">{(result.ai.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">难度：</span>
                      <span className="font-bold text-gray-800">{result.ai.difficulty}</span>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">AI推理：</p>
                      <p className="text-gray-700">{result.ai.reasoning}</p>
                    </div>
                    {result.ai.suggestedAction && (
                      <div className="mt-2 p-2 bg-green-100 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">建议：</p>
                        <p className="text-green-700 text-sm">{result.ai.suggestedAction}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SM-2结果 */}
                <div className={`p-4 rounded-xl border-2 ${result.comparison.winner === 'SM-2' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-800">SM-2算法</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">复习间隔：</span>
                      <span className="font-bold text-gray-800">{result.sm2.interval} 小时</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">置信度：</span>
                      <span className="font-bold text-gray-800">{(result.sm2.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">难度：</span>
                      <span className="font-bold text-gray-800">{result.sm2.difficulty}</span>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">算法说明：</p>
                      <p className="text-gray-700">{result.sm2.reasoning}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 对比分析 */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-2">对比分析</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">间隔差异</p>
                    <p className={`font-bold ${result.comparison.intervalDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.comparison.intervalDiff > 0 ? '+' : ''}{result.comparison.intervalDiff.toFixed(1)} 小时
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">间隔比例</p>
                    <p className="font-bold text-gray-800">{result.comparison.intervalRatio.toFixed(2)}x</p>
                  </div>
                  <div>
                    <p className="text-gray-600">推荐算法</p>
                    <p className={`font-bold ${result.comparison.winner === 'AI' ? 'text-green-600' : result.comparison.winner === 'SM-2' ? 'text-blue-600' : 'text-gray-600'}`}>
                      {result.comparison.winner === 'AI' ? 'AI自适应引擎' : result.comparison.winner === 'SM-2' ? 'SM-2算法' : '两者相当'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 说明 */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💡 测试说明</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>场景1</strong>：新单词首次学习，测试基础预测能力</li>
          <li>• <strong>场景2</strong>：连续正确，测试AI是否给予更长间隔</li>
          <li>• <strong>场景3</strong>：有错误，测试AI是否缩短复习间隔</li>
          <li>• <strong>场景4</strong>：快速掌握，测试AI对反应时间的敏感性</li>
          <li>• <strong>推荐算法</strong>：基于学习表现判断哪个算法更合理</li>
        </ul>
      </div>
    </div>
  );
}
