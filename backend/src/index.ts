import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config';
import { runRedditIngestion } from './redditIngestor';
import { analyzeNewEvents } from './argumentAnalyzer';
import { recomputeTopics } from './topicClusterer';
import healthRouter from './routes/health';
import graphRouter from './routes/graph';
import topicsRouter from './routes/topics';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
  })
);
app.use(express.json());

app.use('/health', healthRouter);
app.use('/graph', graphRouter);
app.use('/topics', topicsRouter);

cron.schedule(config.ingestCron, async () => {
  console.log('Running scheduled ingestion + analysis');
  await runRedditIngestion();
  await analyzeNewEvents();
  await recomputeTopics();
});

const start = async () => {
  app.listen(config.port, async () => {
    console.log(`Backend listening on port ${config.port}`);
    await runRedditIngestion();
    await analyzeNewEvents();
    await recomputeTopics();
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
