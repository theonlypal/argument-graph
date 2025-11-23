import OpenAI from 'openai';
import { prisma } from './prismaClient';
import { config } from './config';

const openai = new OpenAI({ apiKey: config.openAiApiKey });

type Classification = {
  relation: 'support' | 'oppose' | 'neutral';
  confidence: number;
  sentiment: number;
  intensity: number;
};

function isValidRelation(value: string): value is Classification['relation'] {
  return value === 'support' || value === 'oppose' || value === 'neutral';
}

export async function analyzeNewEvents() {
  const unprocessed = await prisma.ingestedEvent.findMany({
    where: { graphNode: null },
    orderBy: { createdAtSource: 'asc' },
    take: 100,
  });

  for (const event of unprocessed) {
    try {
      const parent = event.parentExternalId
        ? await prisma.ingestedEvent.findUnique({ where: { externalId: event.parentExternalId } })
        : null;

      let parentNodeId: number | null = null;

      if (parent) {
        let parentNode = await prisma.graphNode.findUnique({ where: { eventId: parent.id } });
        if (!parentNode) {
          parentNode = await prisma.graphNode.create({
            data: {
              eventId: parent.id,
              sentimentScore: 0,
              intensity: 0,
            },
          });
        }
        parentNodeId = parentNode.id;
      }

      const classification = parent ? await classifyRelation(parent.bodyText, event.bodyText) : null;

      if (!classification && parentNodeId === null) {
        // No parent to relate to, just create a node with neutral defaults
        await prisma.graphNode.create({
          data: {
            eventId: event.id,
            sentimentScore: 0,
            intensity: 0,
          },
        });
        continue;
      }

      if (classification) {
        const node = await prisma.graphNode.create({
          data: {
            eventId: event.id,
            sentimentScore: classification.sentiment,
            intensity: classification.intensity,
          },
        });

        if (parentNodeId !== null) {
          await prisma.graphEdge.create({
            data: {
              fromNodeId: parentNodeId,
              toNodeId: node.id,
              relationType: classification.relation,
              confidence: classification.confidence,
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to analyze event', event.externalId, err);
    }
  }
}

async function classifyRelation(parentText: string, childText: string): Promise<Classification | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that classifies the relationship between a parent comment and a reply. Only output valid JSON with keys relation, confidence, sentiment, intensity.',
        },
        {
          role: 'user',
          content: `Parent comment: ${parentText}\nReply comment: ${childText}\nProvide JSON with relation (support|oppose|neutral), confidence (0..1), sentiment (-1..1) for the reply, and intensity (0..1).`,
        },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(raw) as Classification;
    if (!isValidRelation(parsed.relation)) {
      console.warn('Invalid relation from model', parsed);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('OpenAI classification failed', err);
    return null;
  }
}
