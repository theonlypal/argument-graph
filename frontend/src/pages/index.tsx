import { useEffect, useState } from 'react';
import GraphView from '../components/GraphView';
import Sidebar from '../components/Sidebar';
import { getGraph, getTopics, getTopic } from '../lib/api';
import { GraphResponse, GraphNodeDTO, TopicSummary } from '../lib/types';

export default function Home() {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNodeDTO | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => refreshData(), 60_000);
    return () => clearInterval(interval);
  }, []);

  async function refreshData() {
    try {
      const [graphRes, topicRes] = await Promise.all([getGraph(), getTopics()]);
      setGraph(graphRes);
      setTopics(topicRes);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  }

  async function handleTopicSelect(id: number | null) {
    setSelectedTopicId(id);
    setSelectedNode(null);
    if (id !== null) {
      try {
        const detail = await getTopic(id);
        if (graph) {
          const nodesWithDetails = graph.nodes.map((n) => {
            const detailNode = detail.nodes.find((dn) => dn.id === n.id);
            if (detailNode) {
              return { ...n, bodyText: detailNode.bodyText, author: detailNode.author, url: detailNode.url };
            }
            return n;
          });
          setGraph({ ...graph, nodes: nodesWithDetails });
        }
      } catch (err) {
        console.error('Failed to fetch topic detail', err);
      }
    }
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
      <div style={{ flex: 7 }}>
        <GraphView
          graph={graph}
          onNodeClick={(node) => setSelectedNode(node)}
          highlightedTopicId={selectedTopicId}
        />
      </div>
      <div style={{ flex: 3 }}>
        <Sidebar
          topics={topics}
          selectedTopicId={selectedTopicId}
          onSelectTopic={handleTopicSelect}
          selectedNode={selectedNode}
        />
      </div>
    </div>
  );
}
