# Muse - AI-Powered English Vocabulary Learning Assistant 🎓

<p align="center">
  <img src="public/Muse.png" alt="Muse Logo" width="128" height="128">
</p>

<p align="center">
  <strong>A modern desktop application for English vocabulary learning with AI integration</strong>
</p>

<p align="center">
  <a href="./README_zh-CN.md">中文文档</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#ai-configuration">AI Configuration</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-28.0.0-47848F?logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

---

A desktop English vocabulary learning application built with Electron + React + TypeScript, featuring AI-powered learning assistance.

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
- **Clipboard Translation** - Hotkey-activated AI translation popup

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
│   │   ├── WordCard.tsx       # Word flashcard
│   │   └── TranslationPopup.tsx # Translation popup
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
