import { TopicSummary } from '../lib/types';

export default function HotList({ topics }: { topics: TopicSummary[] }) {
  return (
    <div className="card">
      {topics.map((topic) => (
        <div key={topic.id} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>{topic.label}</div>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>Heat: {topic.heatScore.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
}
