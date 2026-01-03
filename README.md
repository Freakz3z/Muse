# Muse - AI 驱动的英语单词学习助手

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
  <img src="https://img.shields.io/badge/Version-1.5.1-orange" alt="Version">
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
- **快速复习** - 针对快速学习需求，支持复习所有学过的单词（不按记忆算法）
- **单词测验** - 选择题、拼写题两种测验模式
- **学习统计** - 可视化学习进度、正确率、学习曲线
- **词库管理** - 内置多套词库 + 支持 JSON 导入/导出自定义词库
- **快捷键支持** - 完整的键盘快捷键操作，提升学习效率

### 🤖 AI 智能功能
- **AI 智能学习计划** - 根据用户目标和水平自动生成个性化学习方案
  - 智能分析当前英语水平
  - 制定每日/每周学习目标
  - 提供科学的学习策略建议
  - 跟踪学习进度并动态调整
- **无缝融合体验** - AI 生成的内容（深度解释、场景例句）直接嵌入单词卡片，无需手动触发
- **AI 智能生成单词** - 支持根据主题（如"商务英语"、"环境保护"）自动生成单词并批量导入
- **AI 学习教练** - 提供个性化的学习建议、进度分析和薄弱环节洞察
- **AI 智能测验** - 根据用户词汇水平实时生成动态测验题目
- **AI 深度分析** - 搜索单词时提供 AI 驱动的详细分析（词源、用法、易混淆词等）
- **智能数据补全** - 自动检测并补充缺失的单词音标、翻译和词性信息

### 🎯 支持的 AI 服务
| 提供商 | 支持模型 | 需要 API Key |
|--------|---------|-------------|
| **OpenAI** | GPT-4o, GPT-4o-mini 等（支持 DeepSeek、智谱 AI 等兼容协议） | ✅ 是 |
| **Claude** | Claude 3.5 Sonnet, Haiku 等 | ✅ 是 |
| **Gemini** | Gemini 1.5 Pro, Flash 等 | ✅ 是 |
| **Ollama** | Llama3, Mistral 等开源模型 | ❌ 否（本地运行） |
| **自定义** | 任何 OpenAI 兼容 API | 视情况而定 |

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

| 类别 | 技术 |
|----------|------------|
| 框架 | Electron 28 |
| UI 库 | React 18 |
| 语言 | TypeScript 5 |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 存储 | LocalForage (IndexedDB) |
| 图表 | Recharts |
| 动画 | Framer Motion |

## 📁 项目结构

```
Muse/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── src/
│   ├── components/       # 通用组件
│   │   ├── AIAssistant.tsx        # AI 助手组件
│   │   ├── StudyPlanModal.tsx     # AI 学习计划模态框
│   │   ├── WordCard.tsx           # 单词卡片
│   │   └── ...
│   ├── pages/            # 页面组件
│   │   ├── Home.tsx      # 首页（学习计划入口）
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
│   │   │   ├── index.ts  # AI 服务核心（包含学习计划生成）
│   │   │   └── types.ts  # AI 类型定义
│   │   └── dictionary/   # 词典 API 服务
│   ├── store/            # Zustand 状态管理
│   ├── storage/          # IndexedDB 数据存储
│   ├── hooks/            # 自定义 Hooks
│   │   └── useShortcuts.ts  # 快捷键管理
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   │   └── spaced-repetition.ts  # SM-2 算法实现
│   └── data/             # 内置数据
└── package.json
```

## 🎯 核心功能说明

### AI 智能学习计划

Muse 的 AI 学习计划功能会根据你的具体情况，制定科学、可行的学习方案：

1. **个性化分析** - AI 分析你的当前水平、学习目标和可用时间
2. **科学规划** - 基于艾宾浩斯记忆曲线，合理安排新词学习和复习节奏
3. **灵活配置** - 支持设定目标日期、选择重点词汇领域
4. **动态调整** - 每周目标递进，策略具体实用
5. **进度跟踪** - 在首页实时查看学习计划执行情况

### 间隔重复算法 (SM-2)

应用使用 SM-2 算法来安排复习时间，根据用户对单词的掌握程度动态调整复习间隔：

- 回答质量 0-5 分
- 易度因子 (EF) 动态调整
- 智能计算下次复习时间
- 四级评分系统：太简单、记住了、有点难、忘记了

### AI 功能配置

1. 进入 **设置** 页面
2. 在 **AI 服务配置** 区域选择服务商
3. 填入 API Key（Ollama 本地运行不需要）
4. 点击 **测试连接** 验证配置
5. 配置成功后，所有 AI 功能即可使用

### 使用 Ollama (免费、本地运行)

1. 安装 [Ollama](https://ollama.ai/)
2. 下载模型：`ollama pull llama3` (或你喜欢的其他模型)
3. 在 Muse 设置中，选择 **Ollama** 作为服务商
4. 默认地址：`http://localhost:11434`
5. 无需 API Key，点击测试连接即可！

### 学习模式

1. **新词学习** - 学习新单词，可使用 AI 助手获取例句、词义解释、记忆技巧
2. **复习模式** - 复习到期单词，巩固记忆（支持四级评分）
3. **普通测验** - 选择题/拼写题测验
4. **AI 测验** - AI 根据你的词库智能出题
5. **AI 教练** - 获取个性化学习建议

### 数据存储

所有数据本地存储，使用 IndexedDB：
- 单词数据
- 学习记录
- 用户设置
- 学习统计
- AI 学习计划

支持词库的 JSON 格式导出和导入，方便数据备份和迁移。

## ⌨️ 快捷键

### 全局快捷键
| 快捷键 | 功能 |
|----------|--------|
| `Ctrl + Shift + M` | 显示/隐藏主窗口 |

### 学习/复习快捷键（可自定义）
| 快捷键 | 功能 |
|----------|--------|
| `Space` | 显示答案 |
| `1` | 太简单（复习评分） |
| `2` | 记住了（复习评分） |
| `3` | 有点难（复习评分） |
| `4` | 忘记了（复习评分） |
| `R` | 播放发音 |

> 💡 提示：所有快捷键都可在设置页面自定义配置，默认快捷键无需重新设置即可使用。

## 🎨 界面预览

应用采用现代化的 UI 设计：
- 简洁的侧边导航
- 卡片翻转动画
- 渐变色主题
- AI 功能紫色系配色
- 响应式布局
- 统一的学习/复习界面风格

## 📝 开发计划

- [ ] 云端数据同步
- [ ] 更多词库支持
- [ ] 学习社区功能
- [ ] 语音识别练习

## 🤝 参与贡献

欢迎提交 Pull Request 或 Issue！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 开源协议

本项目采用 [Apache 2.0](LICENSE) 开源协议。

---

<p align="center">
  Made with ❤️ for English learners
</p>
