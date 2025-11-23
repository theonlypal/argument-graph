import dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

const requiredEnv = [
  'OPENAI_API_KEY',
  'REDDIT_USER_AGENT',
  'SUBREDDITS',
  'INGEST_INTERVAL_CRON',
];

const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const message = [
    '',
    '[CONFIG ERROR]',
    `Missing required environment variables: ${missing.join(', ')}`,
    'Please create backend/.env based on backend/.env.example and set the values before starting the server.',
    '',
  ].join('\n');
  console.error(message);
  throw new Error('Missing required environment variables');
}

const subreddits = (process.env.SUBREDDITS as string)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  openAiApiKey: process.env.OPENAI_API_KEY as string,
  redditUserAgent: process.env.REDDIT_USER_AGENT as string,
  subreddits,
  ingestCron: process.env.INGEST_INTERVAL_CRON as string,
};
