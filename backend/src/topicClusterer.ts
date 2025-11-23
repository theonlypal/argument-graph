import { prisma } from './prismaClient';

function normalizeTitle(title: string | null): string | null {
  if (!title) return null;
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

export async function recomputeTopics() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentNodes = await prisma.graphNode.findMany({
    where: { event: { createdAtSource: { gte: since } } },
    include: { event: true },
  });

  const groups: Record<string, typeof recentNodes> = {};

  for (const node of recentNodes) {
    const keyParts = [node.event.sourceChannel];
    const normalizedTitle = normalizeTitle(node.event.title || null);
    if (normalizedTitle) keyParts.push(normalizedTitle);
    const key = keyParts.join('::');
    if (!groups[key]) groups[key] = [];
    groups[key].push(node);
  }

  for (const [key, nodes] of Object.entries(groups)) {
    const sample = nodes[0];
    const label = sample.event.title || `${sample.event.sourceChannel} – last 24h`;
    const nodeCount = nodes.length;
    const avgIntensity =
      nodes.reduce((sum: number, n: typeof nodes[number]) => sum + n.intensity, 0) / nodeCount;
    const recentBoost = nodes.some((n: typeof nodes[number]) => n.event.createdAtSource > new Date(Date.now() - 60 * 60 * 1000))
      ? 10
      : 0;
    const heat = nodeCount * 0.5 + avgIntensity * 50 + recentBoost;

    const existing = await prisma.topicCluster.findFirst({ where: { label } });
    let topicId: number;
    if (existing) {
      const updated = await prisma.topicCluster.update({
        where: { id: existing.id },
        data: { heatScore: heat },
      });
      topicId = updated.id;
    } else {
      const created = await prisma.topicCluster.create({ data: { label, heatScore: heat } });
      topicId = created.id;
    }

    const nodeIds = nodes.map((n: typeof nodes[number]) => n.id);
    await prisma.graphNode.updateMany({ where: { id: { in: nodeIds } }, data: { topicId } });
  }
}
