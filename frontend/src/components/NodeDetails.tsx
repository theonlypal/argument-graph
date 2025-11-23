import { GraphNodeDTO } from '../lib/types';

export default function NodeDetails({ node }: { node: GraphNodeDTO | null }) {
  if (!node) return <div className="card">Select a node to see details.</div>;

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Comment</div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>{node.bodyText || node.label}</div>
      <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 6 }}>
        Sentiment: {node.sentimentScore.toFixed(2)} · Intensity: {node.intensity.toFixed(2)}
      </div>
      {node.author && (
        <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 6 }}>Author: {node.author}</div>
      )}
      {node.url && (
        <a href={node.url} target="_blank" rel="noreferrer">
          View on Reddit
        </a>
      )}
    </div>
  );
}
