/**
 * AI自适应引擎自动化测试脚本
 *
 * 用于测试AI预测和对比SM-2算法
 */

const testScenarios = [
  {
    name: '场景1: 新单词首次学习',
    description: '用户第一次学习这个单词',
    wordHistory: [{
      action: 'learn',
      result: 'correct',
      timestamp: Date.now() - 1000 * 60 * 60,
      timeTaken: 3000,
      confidence: 0.7,
    }],
    expected: {
      aiInterval: '4-12小时',
      sm2Interval: '24小时',
      reasoning: '新词应该给予更短的初始间隔'
    }
  },
  {
    name: '场景2: 连续3次正确',
    description: '用户已经连续3次正确回答',
    wordHistory: [
      { action: 'learn', result: 'correct', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, timeTaken: 2500, confidence: 0.8 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, timeTaken: 2000, confidence: 0.85 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, timeTaken: 1800, confidence: 0.9 }
    ],
    expected: {
      aiInterval: '3-7天',
      sm2Interval: '7天',
      reasoning: '连续正确应该延长复习间隔'
    }
  },
  {
    name: '场景3: 有错误的复习',
    description: '用户学习过程中有错误',
    wordHistory: [
      { action: 'learn', result: 'correct', timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, timeTaken: 3000, confidence: 0.7 },
      { action: 'review', result: 'incorrect', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, timeTaken: 5000, confidence: 0.5 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, timeTaken: 4000, confidence: 0.6 },
      { action: 'review', result: 'incorrect', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, timeTaken: 6000, confidence: 0.4 }
    ],
    expected: {
      aiInterval: '4-12小时',
      sm2Interval: '1天',
      reasoning: '有错误应该缩短复习间隔'
    }
  },
  {
    name: '场景4: 快速掌握(反应快)',
    description: '用户反应时间很短,掌握很好',
    wordHistory: [
      { action: 'learn', result: 'correct', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, timeTaken: 1500, confidence: 0.9 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, timeTaken: 1200, confidence: 0.95 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, timeTaken: 1000, confidence: 0.95 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, timeTaken: 900, confidence: 0.98 },
      { action: 'review', result: 'correct', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, timeTaken: 800, confidence: 1.0 }
    ],
    expected: {
      aiInterval: '7-14天',
      sm2Interval: '16天',
      reasoning: '快速掌握应该给予更长间隔'
    }
  }
];

console.log('🧪 AI自适应引擎测试场景\n');
console.log('=' .repeat(60));

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  console.log(`   学习历史: ${scenario.wordHistory.length}次`);
  console.log(`   预期AI间隔: ${scenario.expected.aiInterval}`);
  console.log(`   预期SM-2间隔: ${scenario.expected.sm2Interval}`);
  console.log(`   理由: ${scenario.expected.reasoning}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ 测试场景已准备就绪!');
console.log('\n请访问 http://localhost:5174/test-adaptive 查看实际测试结果');
console.log('\n或者继续开发自动化测试...\n');
