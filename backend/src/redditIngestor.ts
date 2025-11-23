import axios from 'axios';
import { config } from './config';
import { prisma } from './prismaClient';

async function runRedditIngestion(): Promise<void> {
  for (const subreddit of config.subreddits) {
    const url = `https://www.reddit.com/r/${subreddit}/comments.json?limit=50&sort=new`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': config.redditUserAgent,
        },
      });

      const children = response.data?.data?.children ?? [];

      for (const child of children) {
        const data = child?.data;
        if (!data || !data.id) continue;

        const bodyText: string | undefined = data.body ?? data.selftext;
        if (!bodyText) continue;

        const commentId: string = data.id;
        const parentIdRaw: string | null = data.parent_id ?? null;
        const parentExternalId = parentIdRaw ? parentIdRaw.replace(/^t[13]_/, '') : null;
        const createdAtSource = typeof data.created_utc === 'number' ? new Date(data.created_utc * 1000) : new Date();
        const permalink: string | undefined = data.permalink;
        const title: string | undefined = data.link_title ?? data.title;

        try {
          await prisma.ingestedEvent.upsert({
            where: { externalId: commentId },
            update: {
              parentExternalId,
              url: permalink ? `https://reddit.com${permalink}` : '',
              author: data.author ?? null,
              title: title ?? null,
              bodyText,
              createdAtSource,
              sourceChannel: subreddit,
            },
            create: {
              platform: 'reddit',
              sourceChannel: subreddit,
              externalId: commentId,
              parentExternalId,
              url: permalink ? `https://reddit.com${permalink}` : '',
              author: data.author ?? null,
              title: title ?? null,
              bodyText,
              createdAtSource,
            },
          });
        } catch (err) {
          console.error(`Failed to upsert comment ${commentId} from r/${subreddit}:`, err);
        }
      }
    } catch (err: any) {
      const message = err?.message || 'Unknown error';
      console.error(`Error fetching subreddit r/${subreddit}: ${message}`);
    }
  }
}

export { runRedditIngestion };
