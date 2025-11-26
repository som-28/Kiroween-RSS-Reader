# Deployment Guide

This is a full-stack application with separate frontend and backend deployments.

## Backend Deployment (Render/Railway/Heroku)

### Option A: Deploy to Render (Free tier available)

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: haunted-rss-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:

   ```
   NODE_ENV=production
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key
   ```

6. Deploy and copy the backend URL (e.g., `https://haunted-rss-backend.onrender.com`)

### Option B: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - Add environment variables (same as above)
5. Deploy and copy the backend URL

## Frontend Deployment (Vercel)

1. In Vercel Dashboard:
   - Go to Project Settings
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

2. Add Environment Variable:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

   (Replace with your actual backend URL from step above)

3. Redeploy

## Local Development

1. Backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Important Notes

- The backend needs a persistent database. For production, consider:
  - Using PostgreSQL instead of SQLite
  - Mounting a persistent volume for SQLite
  - Using a managed database service

- Make sure to set all required environment variables in both deployments

- The frontend will not work without a running backend
