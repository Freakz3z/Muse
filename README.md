# Muse - AI 驱动的英语单词学习助手 🎓

<p align="center">
  <img src="public/Muse.png" alt="Muse Logo" width="128" height="128">
</p>

<p align="center">
  <strong>AI 驱动的智能英语学习助手</strong>
</p>

<p align="center">
  融合先进 AI 技术与科学学习方法，彻底变革你的单词学习体验
</p>

<p align="center">
  <a href="./README_EN.md">English</a> •
  <a href="#功能特点">功能特点</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#ai-功能配置">AI 配置</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-28.0.0-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue" alt="License">
</p>

<p align="center">
  本项目由阿里云ESA提供加速、计算和保护
  <br>
  <img src="AlibabaESA.png" alt="Alibaba ESA" width="600">
</p>

---

**Muse** 是一款基于 Electron + React + TypeScript 开发的 **AI 驱动的智能英语学习助手**。它利用先进的 AI 技术为用户提供个性化学习体验、智能内容生成和自适应学习计划，让单词学习变得更高效、更有趣。

## 🌟 核心理念

**AI 驱动的智能学习** - Muse 将 AI 能力贯穿于整个学习流程：
- 🧠 **智能内容生成** - AI 创建场景化例句、深度解释和记忆技巧
- 🎯 **个性化学习路径** - AI 分析你的进度并提供定制学习计划
- ✨ **自适应考核** - AI 生成适应你词汇水平的动态测验
- 📈 **智能进度跟踪** - AI 教练提供数据驱动的洞察和建议

## ✨ 功能特点

### 📚 核心学习功能
- **单词学习** - 卡片翻转式学习体验，支持音标、释义、例句展示
- **智能复习** - 基于 SM-2 艾宾浩斯记忆曲线的间隔重复算法
- **单词测验** - 选择题、拼写题两种测验模式
- **学习统计** - 可视化学习进度、正确率、学习曲线
- **词库管理** - 内置多套词库 + 支持 JSON 导入自定义词库

### 🤖 AI 智能功能
- **AI 智能例句** - 根据单词生成地道实用的例句，附带中文翻译
- **AI 词义解释** - 深度解析单词含义、用法要点、常见错误、文化背景
- **AI 记忆技巧** - 智能生成联想记忆、词根分析等记忆技巧
- **AI 智能测验** - AI 根据词库自动生成个性化测验题目
- **AI 学习教练** - 分析学习数据，提供个性化学习建议和每日计划
- **单词搜索** - 搜索任意单词并获取 AI 深度分析

### 🎯 支持的 AI 服务
- **OpenAI** - GPT-4o-mini, GPT-4o 等模型
- **DeepSeek** - DeepSeek-Chat 等国产大模型
- **智谱 AI** - GLM-4-Flash 等模型
- **Ollama** - 本地运行的开源模型（无需 API Key）
- **自定义** - 支持任何 OpenAI 兼容 API

### 📖 内置词库
- 基础词汇（~440词）- 入门高频词汇
- CET-4 核心词汇（~400词）- 大学四级必备
- CET-6 进阶词汇（~400词）- 大学六级核心
- 雅思词汇（~400词）- IELTS 考试高频词
- 托福词汇（~400词）- TOEFL 考试必备词

词汇详情通过 Free Dictionary API 动态加载，包含音标、释义、例句等。

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run electron:dev
```

### 构建应用

```bash
npm run electron:build
```

构建完成后，安装包将在 `release` 目录中生成。

## 🛠️ 技术栈

- **Electron 28** - 跨平台桌面应用框架
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Tailwind CSS** - 样式框架
- **Zustand** - 状态管理
- **LocalForage** - 本地 IndexedDB 存储
- **Recharts** - 图表库
- **Framer Motion** - 动画库

## 📁 项目结构

```
Muse_Electron/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── src/
│   ├── components/       # 通用组件
│   │   ├── AIAssistant.tsx    # AI 助手组件
│   │   ├── WordCard.tsx       # 单词卡片
│   │   └── ...
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx      # 首页
│   │   ├── Learn.tsx     # 学习页面
│   │   ├── Review.tsx    # 复习页面
│   │   ├── Quiz.tsx      # 测验页面
│   │   ├── AIQuiz.tsx    # AI 测验页面
│   │   ├── AICoach.tsx   # AI 学习教练
│   │   ├── WordBook.tsx  # 词库管理
│   │   ├── Statistics.tsx # 统计页面
│   │   └── Settings.tsx  # 设置页面
│   ├── services/
│   │   ├── ai/           # AI 服务
│   │   │   ├── index.ts  # AI 服务核心
│   │   │   └── types.ts  # AI 类型定义
│   │   └── dictionary/   # 词典 API 服务
│   ├── store/            # Zustand 状态管理
│   ├── storage/          # IndexedDB 数据存储
│   ├── hooks/            # 自定义 Hooks
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   └── data/             # 内置数据
└── package.json
```

## 🎯 核心功能说明

### 间隔重复算法 (SM-2)

应用使用 SM-2 算法来安排复习时间，根据用户对单词的掌握程度动态调整复习间隔：

- 回答质量 0-5 分
- 易度因子 (EF) 动态调整
- 智能计算下次复习时间

### AI 功能配置

1. 进入 **设置** 页面
2. 在 **AI 服务配置** 区域选择服务商
3. 填入 API Key（Ollama 本地运行不需要）
4. 点击 **测试连接** 验证配置
5. 配置成功后，所有 AI 功能即可使用

### 学习模式

1. **新词学习** - 学习新单词，可使用 AI 助手获取例句、词义解释、记忆技巧
2. **复习模式** - 复习到期单词，巩固记忆
3. **普通测验** - 选择题/拼写题测验
4. **AI 测验** - AI 根据你的词库智能出题
5. **AI 教练** - 获取个性化学习建议

### 数据存储

所有数据本地存储，使用 IndexedDB：
- 单词数据
- 学习记录
- 用户设置
- 学习统计

## ⌨️ 快捷键

### 全局快捷键
- `Ctrl + Shift + M` - 显示/隐藏主窗口
- `Ctrl + Shift + C` - 剪贴板翻译

### 学习/复习快捷键（可自定义）
- `Space` - 显示答案
- `Q` - 上一个单词
- `E` - 下一个单词
- `D` - 标记认识
- `A` - 标记不认识
- `R` - 播放发音
- `1-4` - 复习评分

## 🎨 界面预览

应用采用现代化的 UI 设计：
- 简洁的侧边导航
- 卡片翻转动画
- 渐变色主题
- AI 功能紫色系配色
- 响应式布局

## 📝 开发计划

- [x] AI 智能释义生成
- [x] AI 例句生成
- [x] AI 智能测验
- [x] AI 学习建议
- [x] 剪贴板翻译
- [x] 自定义快捷键
- [ ] 云端数据同步
- [ ] 更多词库支持
- [ ] 学习社区功能
- [ ] 语音识别练习

## 📄 License

Apache 2.0 License

---

Made with ❤️ for English learners

### Build for Production

```bash
npm run electron:build
```

The installer will be generated in the `release` directory.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Electron 28 |
| UI | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Storage | LocalForage (IndexedDB) |
| Charts | Recharts |
| Animation | Framer Motion |

## 📁 Project Structure

```
Muse_Electron/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   └── preload.ts        # Preload script
├── src/
│   ├── components/       # Reusable components
│   │   ├── AIAssistant.tsx    # AI assistant component
│   │   └── WordCard.tsx       # Word flashcard
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Dashboard
│   │   ├── Learn.tsx     # Learning page
│   │   ├── Review.tsx    # Review page
│   │   ├── Quiz.tsx      # Quiz page
│   │   ├── AIQuiz.tsx    # AI Quiz page
│   │   ├── AICoach.tsx   # AI Learning Coach
│   │   ├── WordBook.tsx  # Vocabulary management
│   │   ├── Statistics.tsx # Statistics page
│   │   └── Settings.tsx  # Settings page
│   ├── services/
│   │   ├── ai/           # AI service
│   │   └── dictionary/   # Dictionary API service
│   ├── store/            # Zustand state management
│   ├── storage/          # IndexedDB storage
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── package.json
```

## 🎯 AI Configuration

1. Go to **Settings** page
2. In **AI Service Configuration** section, select your provider
3. Enter your API Key (not required for local Ollama)
4. Click **Test & Save** to verify the configuration
5. Once configured, all AI features will be available

### Using Ollama (Free, Local)

1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull llama3`
3. In Muse settings, select "Ollama" as provider
4. Default endpoint: `http://localhost:11434`
5. No API key needed!

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + M` | Show/Hide main window |
| `Ctrl + Shift + C` | Clipboard translation |

### Learning Shortcuts (Customizable)
| Shortcut | Action |
|----------|--------|
| `Space` | Show answer |
| `Q` | Previous word |
| `E` | Next word |
| `D` | Mark as known |
| `A` | Mark as unknown |
| `R` | Play pronunciation |
| `1-4` | Review rating |

## 📝 Roadmap

- [x] AI word explanations
- [x] AI example sentences
- [x] AI smart quiz
- [x] AI learning suggestions
- [x] Clipboard translation
- [x] Custom shortcuts
- [ ] Cloud sync
- [ ] More vocabulary books
- [ ] Learning community
- [ ] Voice recognition practice

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for English learners worldwide
</p>
