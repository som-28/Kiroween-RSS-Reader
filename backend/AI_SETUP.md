# AI Service Setup - Google Gemini (FREE!)

The Haunted RSS Reader now uses **Google Gemini** as the default AI provider because it offers a **generous free tier**!

## ✅ Why Gemini?

- **FREE tier** with 60 requests per minute
- No credit card required
- Better than OpenAI for most summarization tasks
- Easy to set up

## 🚀 Quick Setup

### 1. Get Your Free Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add to `.env` File

```bash
# In backend/.env
GEMINI_API_KEY=your_api_key_here
AI_PROVIDER_ORDER=gemini,fallback
```

### 3. Restart the Backend

```bash
cd backend
npm run dev
```

That's it! Your app will now use Gemini for:

- Article summarization
- Topic extraction
- Entity recognition

## 🎯 Alternative Providers

If you want to use other providers, the app supports:

### OpenAI (Paid)

```bash
OPENAI_API_KEY=sk-...
AI_PROVIDER_ORDER=openai,gemini,fallback
```

### Anthropic Claude (Paid)

```bash
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER_ORDER=anthropic,gemini,fallback
```

### Ollama (Local, FREE but requires setup)

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
AI_PROVIDER_ORDER=ollama,gemini,fallback
```

## 🔊 Text-to-Speech

For audio summaries, the app uses **Web Speech API** (built-in browser, no API key needed!).

If you want higher quality audio, you can optionally add:

### ElevenLabs (Paid, but has free tier)

```bash
ELEVENLABS_API_KEY=your_key_here
```

Get your key at: https://elevenlabs.io/

## 🆘 Troubleshooting

### "AI provider error, using fallback"

This means your API key isn't working. Check:

1. Is your API key correct in `.env`?
2. Did you restart the backend after adding the key?
3. Have you exceeded the free tier limits?

### Fallback Mode

If no AI provider is available, the app uses a simple fallback:

- Summary = Article excerpt (first 300 characters)
- Topics = Keywords from title
- Entities = Capitalized words from content

This works but isn't as good as AI-powered analysis.

## 📊 Free Tier Limits

**Google Gemini Free Tier:**

- 60 requests per minute
- 1,500 requests per day
- Perfect for personal use!

**Recommendation:** Stick with Gemini unless you need more than 1,500 articles per day.
