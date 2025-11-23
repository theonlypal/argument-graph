import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { GraphResponse, GraphNodeDTO } from '../lib/types';

const ForceGraph2D = dynamic(() => import('react-force-graph').then((mod) => mod.ForceGraph2D), {
  ssr: false,
});

function nodeColor(sentiment: number) {
  if (sentiment > 0.2) return '#34d399';
  if (sentiment < -0.2) return '#f87171';
  return '#cbd5e1';
}

function edgeColor(relation: string) {
  if (relation === 'support') return '#34d399';
  if (relation === 'oppose') return '#f87171';
  return '#60a5fa';
}

type Props = {
  graph: GraphResponse | null;
  onNodeClick: (node: GraphNodeDTO) => void;
  highlightedTopicId?: number | null;
};

export default function GraphView({ graph, onNodeClick, highlightedTopicId }: Props) {
  const data = useMemo(() => {
    if (!graph) return { nodes: [], links: [] } as any;
    const filteredNodes = highlightedTopicId
      ? graph.nodes.filter((n) => n.topicId === highlightedTopicId)
      : graph.nodes;
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graph.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes: filteredNodes, links: filteredEdges } as any;
  }, [graph, highlightedTopicId]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ForceGraph2D
        graphData={data}
        backgroundColor="#0f172a"
        nodeLabel={(node: any) => node.label}
        nodeColor={(node: any) => nodeColor(node.sentimentScore)}
        nodeVal={(node: any) => Math.max(4, node.intensity * 12 + 4)}
        linkColor={(link: any) => edgeColor(link.relationType)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: any) => Math.max(1, link.confidence * 3)}
        onNodeClick={(node: any) => onNodeClick(node as GraphNodeDTO)}
      />
    </div>
  );
}
