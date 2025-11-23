import axios from 'axios';
import { GraphResponse, TopicDetail, TopicSummary } from './types';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function getGraph(): Promise<GraphResponse> {
  const res = await axios.get(`${baseURL}/graph`);
  return res.data;
}

export async function getTopics(): Promise<TopicSummary[]> {
  const res = await axios.get(`${baseURL}/topics`);
  return res.data;
}

export async function getTopic(id: number): Promise<TopicDetail> {
  const res = await axios.get(`${baseURL}/topics/${id}`);
  return res.data;
}
