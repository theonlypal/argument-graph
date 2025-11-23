import { TopicSummary } from '../lib/types';

interface Props {
  topics: TopicSummary[];
  onSelectTopic: (id: number | null) => void;
  selectedTopicId: number | null;
}

export default function TopicList({ topics, onSelectTopic, selectedTopicId }: Props) {
  return (
    <div className="card" style={{ maxHeight: 220, overflowY: 'auto' }}>
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="topic-item"
          onClick={() => onSelectTopic(topic.id === selectedTopicId ? null : topic.id)}
          style={{
            padding: '8px',
            borderRadius: 6,
            background: topic.id === selectedTopicId ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            marginBottom: 6,
          }}
        >
          <div style={{ fontWeight: 600 }}>{topic.label}</div>
          <div style={{ fontSize: 12, color: '#cbd5e1' }}>
            Heat: {topic.heatScore.toFixed(1)} · Nodes: {topic.nodeCount}
          </div>
        </div>
      ))}
    </div>
  );
}
