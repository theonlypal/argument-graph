import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const topics = await prisma.topicCluster.findMany({
      orderBy: { heatScore: 'desc' },
      include: { nodes: true },
      take: 50,
    });

    const summaries = topics.map((t: typeof topics[number]) => ({
      id: t.id,
      label: t.label,
      heatScore: t.heatScore,
      nodeCount: t.nodes.length,
    }));

    res.json(summaries);
  } catch (err) {
    console.error('Failed to fetch topics', err);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid topic id' });
    return;
  }

  try {
    const topic = await prisma.topicCluster.findUnique({
      where: { id },
      include: {
        nodes: { include: { event: true } },
      },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const nodeIds = topic.nodes.map((n: typeof topic.nodes[number]) => n.id);
    const edges = await prisma.graphEdge.findMany({
      where: { OR: [{ fromNodeId: { in: nodeIds } }, { toNodeId: { in: nodeIds } }] },
    });

    const payload = {
      id: topic.id,
      label: topic.label,
      heatScore: topic.heatScore,
      nodes: topic.nodes.map((n: typeof topic.nodes[number]) => ({
        id: n.id,
        eventId: n.eventId,
        bodyText: n.event.bodyText,
        author: n.event.author,
        sentimentScore: n.sentimentScore,
        intensity: n.intensity,
        url: n.event.url,
      })),
      edges: edges.map((e: typeof edges[number]) => ({
        id: e.id,
        source: e.fromNodeId,
        target: e.toNodeId,
        relationType: e.relationType,
        confidence: e.confidence,
      })),
    };

    res.json(payload);
  } catch (err) {
    console.error('Failed to fetch topic', err);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

export default router;
