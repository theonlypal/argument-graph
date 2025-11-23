import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const nodes = await prisma.graphNode.findMany({
      where: { createdAt: { gte: since } },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const edges = await prisma.graphEdge.findMany({
      where: { toNode: { createdAt: { gte: since } } },
      orderBy: { createdAt: 'desc' },
      take: 1500,
    });

    const nodeDtos = nodes.map((node: typeof nodes[number]) => ({
      id: node.id,
      eventId: node.eventId,
      label: node.event.author
        ? `${node.event.author}: ${node.event.bodyText.slice(0, 80)}`
        : node.event.bodyText.slice(0, 80),
      sentimentScore: node.sentimentScore,
      intensity: node.intensity,
      topicId: node.topicId,
      bodyText: node.event.bodyText,
      author: node.event.author,
      url: node.event.url,
    }));

    const edgeDtos = edges.map((edge: typeof edges[number]) => ({
      id: edge.id,
      source: edge.fromNodeId,
      target: edge.toNodeId,
      relationType: edge.relationType as 'support' | 'oppose' | 'neutral',
      confidence: edge.confidence,
    }));

    res.json({ nodes: nodeDtos, edges: edgeDtos });
  } catch (err) {
    console.error('Failed to fetch graph', err);
    res.status(500).json({ error: 'Failed to fetch graph' });
  }
});

export default router;
