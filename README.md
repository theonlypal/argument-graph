# argument-graph

Real-time argument graph from Reddit using OpenAI.

## Prerequisites
- Node.js (>=18)
- pnpm (recommended) or npm

## Setup
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure backend environment variables:
   ```bash
   cd backend
   cp .env.example .env
   # fill in your OpenAI and Reddit credentials
   ```

3. Run database migrations and generate Prisma client:
   ```bash
   pnpm backend:migrate
   pnpm backend:generate
   ```

## Running in development
From the project root:
```bash
pnpm dev
```
- Frontend runs at http://localhost:3000
- Backend runs at http://localhost:4000

## Environment variables (backend)
- `PORT`: Port for Express (default 4000)
- `OPENAI_API_KEY`: OpenAI API key
- `REDDIT_CLIENT_ID`: Reddit application client ID
- `REDDIT_CLIENT_SECRET`: Reddit application client secret
- `REDDIT_USERNAME`: Reddit username
- `REDDIT_PASSWORD`: Reddit password
- `REDDIT_USER_AGENT`: Custom user agent string
- `SUBREDDITS`: Comma-separated list of subreddits to ingest
- `INGEST_INTERVAL_CRON`: Cron expression for ingestion cadence

## Architecture
- **Backend**: Express + Prisma + SQLite, ingesting Reddit comments, classifying relationships with OpenAI, and clustering topics.
- **Frontend**: Next.js + React + react-force-graph for visualization.

## Deployment notes
- Backend can be deployed to Railway. Ensure SQLite storage is persisted and environment variables are set.
- Frontend can be deployed to Vercel. Set `NEXT_PUBLIC_BACKEND_URL` to your deployed backend URL.
