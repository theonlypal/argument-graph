import { TopicSummary } from '../lib/types';
import TopicList from './TopicList';
import HotList from './HotList';
import NodeDetails from './NodeDetails';

interface SidebarProps {
  topics: TopicSummary[];
  selectedTopicId: number | null;
  onSelectTopic: (id: number | null) => void;
  selectedNode: any;
}

export default function Sidebar({ topics, selectedTopicId, onSelectTopic, selectedNode }: SidebarProps) {
  const hotTopics = [...topics].sort((a, b) => b.heatScore - a.heatScore).slice(0, 3);

  return (
    <div className="sidebar" style={{ height: '100%', color: '#e2e8f0' }}>
      <h2 style={{ marginTop: 0 }}>Topics</h2>
      <TopicList topics={topics} onSelectTopic={onSelectTopic} selectedTopicId={selectedTopicId} />
      <h3>About to Blow Up</h3>
      <HotList topics={hotTopics} />
      <h3>Node Details</h3>
      <NodeDetails node={selectedNode} />
    </div>
  );
}
