import axios from 'axios';
import { prisma } from './prismaClient';
import { config } from './config';

let redditToken: { accessToken: string; expiresAt: number } | null = null;

async function fetchToken() {
  if (redditToken && redditToken.expiresAt > Date.now() + 60_000) {
    return redditToken.accessToken;
  }

  const basicAuth = Buffer.from(`${config.redditClientId}:${config.redditClientSecret}`).toString('base64');

  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', config.redditUsername);
  params.append('password', config.redditPassword);

  const response = await axios.post('https://www.reddit.com/api/v1/access_token', params, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': config.redditUserAgent,
    },
  });

  const data = response.data;
  const expiresInMs = (data.expires_in || 3600) * 1000;
  redditToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  };

  return redditToken.accessToken;
}

export async function runRedditIngestion() {
  try {
    const token = await fetchToken();
    for (const subreddit of config.subreddits) {
      await ingestSubreddit(subreddit, token);
    }
  } catch (err) {
    console.error('Reddit ingestion error', err);
  }
}

async function ingestSubreddit(subreddit: string, token: string) {
  const url = `https://oauth.reddit.com/r/${subreddit}/comments?limit=50&sort=new`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': config.redditUserAgent,
    },
  });

  const comments = response.data?.data?.children || [];
  for (const child of comments) {
    const c = child.data;
    if (!c || !c.id || !c.body) continue;
    const externalId = c.id;
    const parentRaw: string | null = c.parent_id || null;
    const parentExternalId = parentRaw ? parentRaw.replace(/^t[1-3]_/, '') : null;
    const createdAt = new Date((c.created_utc || 0) * 1000);
    const permalink = c.permalink ? `https://reddit.com${c.permalink}` : `https://reddit.com${c.id}`;

    try {
      await prisma.ingestedEvent.upsert({
        where: { externalId },
        update: {
          bodyText: c.body,
          author: c.author || null,
          title: c.link_title || null,
          createdAtSource: createdAt,
          parentExternalId,
          url: permalink,
          sourceChannel: subreddit,
        },
        create: {
          platform: 'reddit',
          sourceChannel: subreddit,
          externalId,
          parentExternalId,
          url: permalink,
          author: c.author || null,
          title: c.link_title || null,
          bodyText: c.body,
          language: c.lang || null,
          createdAtSource: createdAt,
        },
      });
    } catch (err) {
      console.error('Failed to upsert comment', externalId, err);
    }
  }
}
