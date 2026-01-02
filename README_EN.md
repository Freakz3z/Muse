# Muse - AI-Powered English Vocabulary Learning Assistant 🎓

<p align="center">
  <img src="public/Muse.png" alt="Muse Logo" width="128" height="128">
</p>

<p align="center">
  <strong>An AI-driven intelligent English vocabulary learning assistant</strong>
</p>

<p align="center">
  Combining advanced AI technology with proven learning methods to revolutionize your vocabulary learning experience
</p>

<p align="center">
  <a href="./README.md">中文文档</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#ai-configuration">AI Configuration</a>
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

**Muse** is an AI-driven intelligent English vocabulary learning assistant built with Electron + React + TypeScript. It leverages cutting-edge AI technology to provide personalized learning experiences, smart content generation, and adaptive study plans, making vocabulary learning more efficient and engaging.

## 🌟 Core Philosophy

**AI-Driven Intelligent Learning** - Muse integrates AI capabilities throughout the entire learning process:
- 🧠 **Intelligent Content Generation** - AI creates contextual examples, explanations, and memory tips
- 🎯 **Personalized Learning Paths** - AI analyzes your progress and provides customized study plans
- ✨ **Adaptive Assessment** - AI generates dynamic quizzes tailored to your vocabulary level
- 📈 **Smart Progress Tracking** - AI coaches provide data-driven insights and recommendations

## ✨ Features

### 📚 Core Learning Features
- **Flashcard Learning** - Interactive flip-card experience with phonetics, definitions, and examples
- **Smart Review** - Spaced repetition based on SM-2 algorithm (Ebbinghaus forgetting curve)
- **Word Quizzes** - Multiple choice and spelling quiz modes
- **Learning Statistics** - Visual progress tracking, accuracy rates, and learning curves
- **Vocabulary Books** - Built-in word lists + JSON import for custom vocabularies

### 🤖 AI-Powered Features
- **AI Example Sentences** - Generate authentic, practical example sentences with Chinese translations
- **AI Word Explanations** - Deep analysis of word meanings, usage tips, common mistakes, and cultural context
- **AI Memory Tips** - Intelligent generation of mnemonics, etymology analysis, and memory tricks
- **AI Smart Quiz** - AI generates personalized quiz questions based on your vocabulary
- **AI Learning Coach** - Analyzes your learning data to provide personalized suggestions and daily plans
- **Word Search** - Search any word and get AI-powered detailed analysis

### 🎯 Supported AI Services
| Provider | Models | API Key Required |
|----------|--------|------------------|
| **OpenAI** | GPT-4o-mini, GPT-4o, etc. | ✅ Yes |
| **DeepSeek** | DeepSeek-Chat | ✅ Yes |
| **Zhipu AI** | GLM-4-Flash | ✅ Yes |
| **Ollama** | Llama3, Mistral, etc. | ❌ No (Local) |
| **Custom** | Any OpenAI-compatible API | Depends |

### 📖 Built-in Vocabulary Books
- **Basic Vocabulary** (~440 words) - Essential high-frequency words
- **CET-4 Core** (~400 words) - College English Test Level 4
- **CET-6 Advanced** (~400 words) - College English Test Level 6
- **IELTS Vocabulary** (~400 words) - IELTS exam high-frequency words
- **TOEFL Vocabulary** (~400 words) - TOEFL exam essential words

Word details are dynamically loaded via Free Dictionary API, including phonetics, definitions, and examples.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Muse_Electron.git
cd Muse_Electron

# Install dependencies
npm install
```

### Development

```bash
npm run electron:dev
```

### Build

```bash
npm run electron:build
```

## 📄 License

Apache 2.0 License

---

Made with ❤️ for English learners
