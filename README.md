# Muse - AI 驱动的英语单词学习助手

<p align="center">
  <img src="public/Muse.png" alt="Muse Logo" width="128" height="128">
</p>

<p align="center">
  <strong>AI 驱动的智能英语学习助手</strong>
</p>

<p align="center">
  融合先进 AI 技术与科学学习方法,让单词学习更高效、更智能
</p>

<p align="center">
  <a href="./README_EN.md">English</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#ai-配置">AI 配置</a> •
  <a href="#快捷键">快捷键</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-28.0.0-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Version-1.6.3-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue" alt="License">
</p>

<p align="center">
  本项目由阿里云ESA提供加速、计算和保护
  <br>
  <img src="AlibabaESA.png" alt="Alibaba ESA" width="600">
</p>

---

## 📖 简介

**Muse** 是一款基于 Electron + React + TypeScript 开发的 **AI 驱动的智能英语单词学习助手**。它结合了先进的 AI 技术和科学的记忆算法,为用户提供个性化的学习体验。

### 核心特性

- 🧠 **AI 智能学习计划** - 根据你的目标和水平自动生成个性化学习方案
- 📚 **科学记忆算法** - 基于 SM-2 艾宾浩斯遗忘曲线的间隔重复系统
- 🤖 **AI 深度分析** - 提供词义解释、场景例句、记忆技巧
- 🎯 **智能测验系统** - AI 根据你的词汇水平实时生成动态题目
- 🎮 **游戏中心** - 通过字母连线游戏边玩边学,保存发现的单词
- 📊 **可视化统计** - 学习进度、正确率、记忆曲线一目了然
- ⌨️ **完整快捷键** - 高效的键盘操作,提升学习效率
- 🔄 **自动更新检查** - 启动时自动检查更新,支持手动检查最新版本

## ✨ 功能特性

### 📚 学习功能

| 功能 | 描述 |
|------|------|
| **单词学习** | 卡片翻转式学习,支持音标、释义、例句展示 |
| **智能复习** | 基于 SM-2 算法,只在需要时复习即将遗忘的单词 |
| **快速复习** | 一键复习所有学过的单词,不受算法限制 |
| **单词测验** | 选择题、拼写题两种测验模式 |
| **AI 测验** | AI 根据你的词库智能出题,难度自适应 |
| **今日回顾** | 侧边栏显示今天所有学过的单词,支持跨会话查看 |

### 🤖 AI 智能功能

| 功能 | 描述 |
|------|------|
| **AI 学习计划** | 分析你的水平和目标,自动生成个性化学习方案 |
| **AI 智能分析** | 手动触发,提供词源、用法、易混淆词等深度解析 |
| **AI 学习教练** | 提供个性化学习建议和进度分析 |
| **AI 单词生成** | 根据主题自动生成单词并批量导入词库 |
| **智能数据补全** | 自动检测并补充缺失的单词信息 |

### 🎯 支持的 AI 服务

| 提供商 | 支持模型 | API Key |
|--------|---------|---------|
| **OpenAI** | GPT-4o, GPT-4o-mini, Qwen, DeepSeek, 智谱AI 等 | ✅ 必需 |
| **Claude** | Claude 3.5 Sonnet, Haiku 等 | ✅ 必需 |
| **Gemini** | Gemini 1.5 Pro, Flash 等 | ✅ 必需 |
| **Ollama** | Llama3, Mistral 等开源模型 | ❌ 不需要(本地运行) |
| **自定义** | 任何 OpenAI 兼容 API | 视情况而定 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/Freakz3z/Muse.git

# 进入目录
cd Muse

# 安装依赖
npm install
```

### 开发模式

```bash
npm run electron:dev
```

### 构建应用

```bash
# Web 版本
npm run build:web

# Electron 桌面版
npm run electron:build
```

构建完成后,安装包将在 `release` 目录中。

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Electron 28 |
| **UI 库** | React 18 |
| **语言** | TypeScript 5.3 |
| **构建工具** | Vite 5.0 |
| **样式** | Tailwind CSS |
| **状态管理** | Zustand |
| **数据存储** | LocalForage (IndexedDB) |
| **图表** | Recharts |
| **动画** | Framer Motion |
| **图标** | Lucide React |

## 🤖 AI 配置

### 使用 OpenAI / Claude / Gemini

1. 进入 **设置** → **AI 智能服务**
2. 选择服务商
3. 填入 API Key
4. 点击 **测试并保存**

### 使用 Ollama (免费、本地运行)

1. 安装 [Ollama](https://ollama.ai/)
2. 下载模型: `ollama pull llama3`
3. 在设置中选择 **Ollama**
4. 默认地址: `http://localhost:11434`
5. 无需 API Key,点击测试即可!

## ⌨️ 快捷键

### 全局快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Shift + M` | 显示/隐藏主窗口 |
| `Alt + X` | 显示/隐藏悬浮查词窗(可自定义) |

### 学习界面快捷键 (可自定义)

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Space` | 显示答案 / 返回当前学习 | 历史模式时返回 |
| `D` | 认识 / 下一个 | 历史模式时下一个 |
| `A` | 不认识 / 上一个 | 历史模式时上一个 |
| `W` | AI 智能分析 | 需配置 AI |
| `R` | 播放发音 | - |

### 复习界面快捷键 (可自定义)

| 快捷键 | 功能 |
|--------|------|
| `2` | 记住了 |
| `3` | 有点难 |
| `4` | 忘记了 |

> 💡 所有快捷键都可在设置中自定义!

## 🎨 界面特色

- 🎨 现代化卡片式设计
- ✨ 流畅的翻转动画
- 🌈 渐变色主题
- 💜 AI 功能紫色系配色
- 📱 响应式布局
- 🎯 统一的学习/复习界面风格
- 🪟 悬浮查词窗 - 快速查词,随时添加
- 📋 精美的更新日志展示

## 📊 数据存储

- **本地存储**: 使用 IndexedDB,所有数据保存在本地
- **数据安全**: 支持词库 JSON 导出/导入
- **隐私保护**: 无需联网即可使用基础功能(AI 功能除外)

## 🤝 参与贡献

欢迎提交 Pull Request 或 Issue!

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 [Apache 2.0](LICENSE) 开源协议。

## 🙏 致谢

- 感谢所有贡献者
- 感谢开源社区的支持
- 感谢阿里云 ESA 提供的加速服务

---

<p align="center">
  Made with ❤️ for English learners
</p>

<p align="center">
  <!-- Share Badge -->
  <a href="https://twitter.com/intent/tweet?text=Check%20out%20Muse%20-%20An%20AI-powered%20English%20vocabulary%20learning%20assistant%20%F0%9F%9A%80&url=https%3A%2F%2Fgithub.com%2FFreakz3z%2FMuse&hashtags=Muse,EnglishLearning,AI,Vocabulary">
    <img src="https://img.shields.io/badge/Share-%23Twitter-blue?style=for-the-badge&logo=twitter" alt="Share on Twitter">
  </a>
</p>

<p align="center">
  <!-- Star History -->
  <a href="https://star-history.com/#Freakz3z/Muse&Date">
    <img src="https://api.star-history.com/svg?repos=Freakz3z/Muse&type=Date" alt="Star History Chart">
  </a>
</p>
