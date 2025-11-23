import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const requiredEnv = [
  'OPENAI_API_KEY',
  'REDDIT_CLIENT_ID',
  'REDDIT_CLIENT_SECRET',
  'REDDIT_USERNAME',
  'REDDIT_PASSWORD',
  'REDDIT_USER_AGENT',
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const message = `\n[CONFIG ERROR]\nMissing required environment variables: ${missing.join(', ')}\nPlease create backend/.env based on backend/.env.example and set the values before starting the server.\n`;
  console.error(message);
  throw new Error('Missing required environment variables');
}

const subreddits = (process.env.SUBREDDITS || 'politics,worldnews,news,changemyview')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  openAiApiKey: process.env.OPENAI_API_KEY as string,
  redditClientId: process.env.REDDIT_CLIENT_ID as string,
  redditClientSecret: process.env.REDDIT_CLIENT_SECRET as string,
  redditUsername: process.env.REDDIT_USERNAME as string,
  redditPassword: process.env.REDDIT_PASSWORD as string,
  redditUserAgent: process.env.REDDIT_USER_AGENT as string,
  subreddits,
  ingestCron: process.env.INGEST_INTERVAL_CRON || '*/5 * * * *',
};
