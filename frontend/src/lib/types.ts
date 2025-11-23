export type GraphNodeDTO = {
  id: number;
  eventId: number;
  label: string;
  sentimentScore: number;
  intensity: number;
  topicId: number | null;
  bodyText?: string;
  author?: string | null;
  url?: string;
};

export type GraphEdgeDTO = {
  id: number;
  source: number;
  target: number;
  relationType: 'support' | 'oppose' | 'neutral';
  confidence: number;
};

export type GraphResponse = {
  nodes: GraphNodeDTO[];
  edges: GraphEdgeDTO[];
};

export type TopicSummary = {
  id: number;
  label: string;
  heatScore: number;
  nodeCount: number;
};

export type TopicDetail = {
  id: number;
  label: string;
  heatScore: number;
  nodes: Array<{
    id: number;
    eventId: number;
    bodyText: string;
    author: string | null;
    sentimentScore: number;
    intensity: number;
    url: string;
  }>;
  edges: GraphEdgeDTO[];
};
