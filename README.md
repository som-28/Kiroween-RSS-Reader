# 👻 Haunted RSS Reader 🎃

A spooky resurrection of RSS technology, enhanced with AI-powered features and wrapped in a Halloween-themed interface. This project brings dead RSS feeds back to life with modern AI summarization, intelligent curation, and an unforgettable haunted user experience.

## 🕸️ Features

- **RSS Feed Management**: Subscribe to RSS/Atom feeds and aggregate content
- **AI-Powered Summaries**: Get concise summaries of articles using LLM technology
- **Smart Content Filtering**: Personalized content based on your interests
- **Audio Summaries**: Listen to article summaries with text-to-speech
- **Curated Digests**: Daily/weekly digests of the most relevant content
- **Semantic Search**: Find related articles and discover connections
- **Offline Support**: Read cached content without internet connection
- **Halloween UI**: Spooky animations, themed components, and eerie effects

## 🏗️ Project Structure

```
haunted-rss-reader/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   └── package.json
└── package.json       # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI features)
- ElevenLabs API key (optional, for audio summaries)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd haunted-rss-reader
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

**Backend** (`backend/.env`):

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys
```

**Frontend** (`frontend/.env`):

```bash
cp frontend/.env.example frontend/.env
```

4. Start the development servers:

```bash
npm run dev
```

This will start:

- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Individual Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 🎨 Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling with custom Halloween theme
- **Framer Motion** - Animations
- **React Query** - Data fetching and caching
- **Dexie.js** - IndexedDB for offline storage

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **SQLite/PostgreSQL** - Database
- **RSS Parser** - Feed parsing
- **Node-cron** - Scheduled tasks
- **OpenAI API** - AI summarization

## 🧛 Development

### Code Quality

The project uses:

- **ESLint** for linting
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

### Project Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Keep components small and focused
- Write meaningful commit messages
- Test critical functionality

## 📝 License

MIT

## 🎃 Hackathon Category

**Resurrection** - Bringing RSS technology back from the dead with modern AI enhancements!
