import axios from 'axios';
import type { Agent, AgentSummary } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/agents/';

export const getAgentDashboard = (token: string) => 
  axios.get<{ agent: Agent; summary: AgentSummary }>(`${API_URL}dashboard/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const getAgentOrders = (token: string) => 
  axios.get<{ orders: any[] }>(`${API_URL}orders/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const getAgentCommissions = (token: string) => 
  axios.get<any[]>(`${API_URL}commissions/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Re-export types for convenience
export type { Agent, AgentSummary }; 