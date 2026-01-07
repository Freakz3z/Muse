/**
 * 字母连线游戏引擎
 * 在n*n方格中，用户通过点击相邻字母组成单词
 */

export interface GameCell {
  letter: string
  row: number
  col: number
  selected: boolean
  inPath: boolean
}

export interface GameWord {
  word: string
  found: boolean
  hint?: string
}

export interface GameState {
  grid: GameCell[][]
  currentPath: { row: number; col: number }[]
  foundWords: string[]
  allWords: GameWord[]
  score: number
  timeRemaining: number
  isGameOver: boolean
}

export class LetterLinkGameEngine {
  private gridSize: number
  private timeLimit: number
  private state: GameState

  constructor(gridSize: number = 5, timeLimit: number = 120) {
    this.gridSize = gridSize
    this.timeLimit = timeLimit
    this.state = this.initializeState()
  }

  /**
   * 初始化游戏状态
   */
  private initializeState(): GameState {
    return {
      grid: [],
      currentPath: [],
      foundWords: [],
      allWords: [],
      score: 0,
      timeRemaining: this.timeLimit,
      isGameOver: false,
    }
  }

  /**
   * 设置字母网格和可组成的单词
   */
  setGrid(letters: string[][], words: GameWord[]): void {
    const grid: GameCell[][] = []

    for (let row = 0; row < this.gridSize; row++) {
      grid[row] = []
      for (let col = 0; col < this.gridSize; col++) {
        grid[row][col] = {
          letter: letters[row][col],
          row,
          col,
          selected: false,
          inPath: false,
        }
      }
    }

    this.state.grid = grid
    this.state.allWords = words
  }

  /**
   * 处理格子点击
   */
  handleCellClick(row: number, col: number): void {
    if (this.state.isGameOver) return

    // 如果点击的是已选中的最后一个格子，取消选择
    if (
      this.state.currentPath.length > 0 &&
      this.isLastCellInPath(row, col)
    ) {
      this.removeLastFromPath()
      return
    }

    // 如果点击的格子已经在路径中，忽略
    if (this.isCellInPath(row, col)) {
      return
    }

    // 检查是否与最后一个格子相邻
    if (this.state.currentPath.length > 0) {
      const lastCell = this.state.currentPath[this.state.currentPath.length - 1]
      if (!this.isAdjacent(lastCell.row, lastCell.col, row, col)) {
        return // 不相邻，忽略
      }
    }

    // 添加到路径
    this.addToPath(row, col)
  }

  /**
   * 提交当前单词
   */
  submitWord(): { success: boolean; word: string; isNew: boolean } {
    if (this.state.isGameOver || this.state.currentPath.length === 0) {
      return { success: false, word: '', isNew: false }
    }

    const word = this.getCurrentWord()

    // 检查是否是有效单词
    const targetWord = this.state.allWords.find(w => w.word === word)

    if (!targetWord) {
      this.clearPath()
      return { success: false, word, isNew: false }
    }

    // 检查是否已经找到过
    if (this.state.foundWords.includes(word)) {
      this.clearPath()
      return { success: true, word, isNew: false }
    }

    // 新单词
    this.state.foundWords.push(word)
    this.state.score += this.calculateScore(word)
    targetWord.found = true
    this.clearPath()

    return { success: true, word, isNew: true }
  }

  /**
   * 清除当前路径
   */
  clearPath(): void {
    this.state.currentPath.forEach(({ row, col }) => {
      this.state.grid[row][col].selected = false
      this.state.grid[row][col].inPath = false
    })
    this.state.currentPath = []
  }

  /**
   * 获取当前路径组成的单词
   */
  getCurrentWord(): string {
    return this.state.currentPath
      .map(({ row, col }) => this.state.grid[row][col].letter)
      .join('')
  }

  /**
   * 更新计时器
   */
  updateTimer(deltaTime: number): void {
    this.state.timeRemaining = Math.max(0, this.state.timeRemaining - deltaTime)

    if (this.state.timeRemaining === 0) {
      this.state.isGameOver = true
    }
  }

  /**
   * 获取游戏状态
   */
  getState(): Readonly<GameState> {
    return this.state
  }

  /**
   * 获取游戏结果
   */
  getGameResult(): {
    foundWords: string[]
    allWords: GameWord[]
    score: number
    totalWords: number
  } {
    return {
      foundWords: this.state.foundWords,
      allWords: this.state.allWords,
      score: this.state.score,
      totalWords: this.state.allWords.length,
    }
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * 检查两个格子是否相邻（包括对角线）
   */
  private isAdjacent(
    row1: number,
    col1: number,
    row2: number,
    col2: number
  ): boolean {
    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)
    return rowDiff <= 1 && colDiff <= 1
  }

  /**
   * 检查格子是否在路径中
   */
  private isCellInPath(row: number, col: number): boolean {
    return this.state.currentPath.some(
      cell => cell.row === row && cell.col === col
    )
  }

  /**
   * 检查是否是路径中的最后一个格子
   */
  private isLastCellInPath(row: number, col: number): boolean {
    if (this.state.currentPath.length === 0) return false
    const last = this.state.currentPath[this.state.currentPath.length - 1]
    return last.row === row && last.col === col
  }

  /**
   * 添加格子到路径
   */
  private addToPath(row: number, col: number): void {
    this.state.currentPath.push({ row, col })
    this.state.grid[row][col].selected = true
    this.state.grid[row][col].inPath = true
  }

  /**
   * 移除路径中的最后一个格子
   */
  private removeLastFromPath(): void {
    const last = this.state.currentPath.pop()
    if (last) {
      this.state.grid[last.row][last.col].selected = false
      // 更新路径标记
      this.state.currentPath.forEach(cell => {
        this.state.grid[cell.row][cell.col].inPath = true
      })
      if (last && !this.isCellInPath(last.row, last.col)) {
        this.state.grid[last.row][last.col].inPath = false
      }
    }
  }

  /**
   * 计算单词得分
   */
  private calculateScore(word: string): number {
    // 基础分：字母数 * 10
    const baseScore = word.length * 10

    // 长度奖励
    let lengthBonus = 0
    if (word.length >= 4) lengthBonus += 10
    if (word.length >= 5) lengthBonus += 20
    if (word.length >= 6) lengthBonus += 30

    return baseScore + lengthBonus
  }
}
