# Muse - AI-Powered English Vocabulary Learning Assistant

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
  <img src="https://img.shields.io/badge/Version-1.5.0-orange" alt="Version">
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue" alt="License">
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
- **Vocabulary Books** - Built-in word lists + JSON import/export for custom vocabularies
- **Keyboard Shortcuts** - Full keyboard shortcut support for efficient learning

### 🤖 AI-Powered Features
- **AI Study Plan Generator** - Automatically generates personalized study plans based on your goals and level
  - Intelligently analyzes current English proficiency
  - Creates daily/weekly learning targets
  - Provides scientific learning strategies
  - Tracks progress and dynamically adjusts
- **Seamless Integration** - AI-generated content embedded directly into flashcards
- **AI Word Generation** - Automatically generate words based on themes and batch import them
- **AI Learning Coach** - Provides personalized learning suggestions and progress analysis
- **AI Smart Quiz** - Generates dynamic quiz questions in real-time
- **AI Deep Analysis** - Get AI-driven detailed analysis when searching for words
- **Smart Data Enrichment** - Automatically detects and fills in missing word data

### 🎯 Supported AI Services
| Provider | Models | API Key Required |
|----------|--------|------------------|
| **OpenAI** | GPT-4o, GPT-4o-mini, etc. | ✅ Yes |
| **Claude** | Claude 3.5 Sonnet, Haiku, etc. | ✅ Yes |
| **Gemini** | Gemini 1.5 Pro, Flash, etc. | ✅ Yes |
| **Ollama** | Llama3, Mistral, etc. | ❌ No (Local) |
| **Custom** | Any OpenAI-compatible API | Depends |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
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

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Electron 28 |
| UI Library | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Storage | LocalForage (IndexedDB) |
| Charts | Recharts |
| Animation | Framer Motion |

## 🎯 Core Features

### AI Study Plan Generator
Muse's AI study plan feature creates scientific, feasible learning plans:
1. **Personalized Analysis** - AI analyzes your current level and goals
2. **Scientific Planning** - Based on Ebbinghaus forgetting curve
3. **Flexible Configuration** - Set target dates and focus areas
4. **Dynamic Adjustment** - Progressive weekly goals
5. **Progress Tracking** - Real-time status on homepage

### Spaced Repetition (SM-2)
- Response quality 0-5 scale
- Dynamic ease factor adjustment
- Four-level rating: Too Easy, Remembered, A Bit Hard, Forgot

### Learning Modes
1. **New Word Learning** - Learn with AI assistance
2. **Review Mode** - Review due words with four-level rating
3. **Regular Quiz** - Multiple choice/spelling quizzes
4. **AI Quiz** - AI-generated questions
5. **AI Coach** - Personalized suggestions

## ⌨️ Keyboard Shortcuts

### Global
| Shortcut | Function |
|----------|----------|
| `Ctrl + Shift + M` | Show/Hide window |

### Learning/Review (Customizable)
| Shortcut | Function |
|----------|----------|
| `Space` | Show answer |
| `1-4` | Rating levels |
| `R` | Play pronunciation |

## 📝 Development Roadmap

- [ ] Cloud sync
- [ ] More vocabulary books
- [ ] Community features
- [ ] Voice recognition

## 🤝 Contributing

Contributions welcome! Please submit Pull Requests or issues.

## 📄 License

Apache 2.0 License

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md)

### v1.5.0 (Latest)
- ✨ AI study plan generator
- 🎨 UI consistency improvements
- 🐛 Fixed keyboard shortcuts
- 🐛 Fixed audio repeating
- 🔧 Adjusted rating buttons

---

Made with ❤️ for English learners
