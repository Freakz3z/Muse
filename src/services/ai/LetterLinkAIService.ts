/**
 * 字母连线游戏的AI服务
 * 生成字母网格和可组成的单词
 */

import { aiService } from './index'
import { GameWord } from '../games/LetterLinkGameEngine'

export interface LetterGridGeneration {
  letters: string[][]
  words: GameWord[]
}

export class LetterLinkAIService {
  /**
   * 生成字母网格和可组成的单词
   * @param gridSize 网格大小（默认5x5）
   * @param wordCount 生成的单词数量（默认8-12个）
   * @param difficulty 难度级别：easy, medium, hard
   */
  async generateGameGrid(
    gridSize: number = 5,
    wordCount: { min: number; max: number } = { min: 8, max: 12 },
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<LetterGridGeneration> {
    try {
      // 构建提示词
      const prompt = this.buildPrompt(gridSize, wordCount, difficulty)

      // 使用aiService.chat方法调用AI
      const response = await aiService.chat([
        {
          role: 'system',
          content: `你是一个专业的英语单词游戏设计专家。你需要设计一个字母连线游戏的网格。

游戏规则：
1. 在 ${gridSize}x${gridSize} 的网格中放置字母
2. 玩家需要通过点击相邻的字母（包括对角线）来组成单词
3. 所有单词必须能够在网格中找到路径
4. 单词必须按正确顺序排列（字母在网格中必须相邻）

请确保：
- 单词之间可以共享字母
- 单词难度适合 ${difficulty === 'easy' ? '初学者' : difficulty === 'medium' ? '中级学习者' : '高级学习者'}
- 字母布局合理，避免过于简单或过于困难
- 提供准确的单词释义和提示`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ])

      const content = response.content
      if (!content) {
        throw new Error('AI返回内容为空')
      }

      // 提取JSON内容
      let jsonStr = content.trim()

      // 尝试提取代码块中的JSON
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1]
      } else {
        // 如果没有代码块，尝试提取第一个JSON对象
        const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          jsonStr = jsonObjectMatch[0]
        }
      }

      // 解析AI响应
      const result = JSON.parse(jsonStr)

      // 验证和格式化结果
      return this.validateAndFormat(result, gridSize)
    } catch (error) {
      console.error('生成游戏网格失败:', error)
      throw new Error('生成游戏失败，请稍后重试')
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(
    gridSize: number,
    wordCount: { min: number; max: number },
    difficulty: 'easy' | 'medium' | 'hard'
  ): string {
    const count =
      Math.floor(Math.random() * (wordCount.max - wordCount.min + 1)) +
      wordCount.min

    const difficultyGuide = {
      easy: '3-5个字母的常用词汇（CEFR A1-A2级别）',
      medium: '4-7个字母的词汇（CEFR A2-B2级别）',
      hard: '6-10个字母的复杂词汇（CEFR B2-C1级别）',
    }

    return `请生成一个字母连线游戏的配置。

**要求：**
1. 网格大小：${gridSize}x${gridSize}
2. 单词数量：${count}个
3. 单词难度：${difficultyGuide[difficulty]}

**返回格式：**
只返回JSON对象，不要添加任何其他文字说明、解释或markdown标记。
\`\`\`json
{
  "letters": [
    ["第一行字母1", "第一行字母2", ...],
    ["第二行字母1", "第二行字母2", ...],
    ...
  ],
  "words": [
    {
      "word": "单词1",
      "hint": "单词的中文释义或提示"
    },
    {
      "word": "单词2",
      "hint": "单词的中文释义或提示"
    }
  ]
}
\`\`\`

**重要提示：**
- letters 数组必须包含 ${gridSize} 行，每行 ${gridSize} 个字母
- 所有字母必须是大写英文字母
- 确保每个单词都能在网格中通过相邻字母找到
- 单词必须在网格中按正确顺序排列（相邻字母，包括对角线）
- 提供准确的中文释义或提示

请直接生成上面的JSON对象，不要添加任何其他内容。`
  }

  /**
   * 验证和格式化AI返回的结果
   */
  private validateAndFormat(
    result: any,
    gridSize: number
  ): LetterGridGeneration {
    // 验证letters
    if (!result.letters || !Array.isArray(result.letters)) {
      throw new Error('缺少letters字段')
    }

    if (result.letters.length !== gridSize) {
      throw new Error(`字母网格行数必须为${gridSize}`)
    }

    for (let row of result.letters) {
      if (!Array.isArray(row) || row.length !== gridSize) {
        throw new Error(`每行必须有${gridSize}个字母`)
      }
      for (let letter of row) {
        if (typeof letter !== 'string' || letter.length !== 1) {
          throw new Error('每个格子必须是单个字母')
        }
      }
    }

    // 验证words
    if (!result.words || !Array.isArray(result.words)) {
      throw new Error('缺少words字段')
    }

    const words: GameWord[] = result.words.map((w: any) => ({
      word: w.word.toUpperCase(),
      hint: w.hint || '',
      found: false,
    }))

    // 转换字母为大写
    const letters: string[][] = result.letters.map((row: string[]) =>
      row.map((letter: string) => letter.toUpperCase())
    )

    return { letters, words }
  }
}

// 导出单例
export const letterLinkAIService = new LetterLinkAIService()
