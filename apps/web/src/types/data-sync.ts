// TypeScript interfaces for Data Synchronization System

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  avatar?: string;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  timestamp: string;
}

export interface MuseumItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  owner?: string | null;
}

export interface MuseumResponse {
  data: MuseumItem[];
  timestamp: string;
}

export interface DataSyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface DataSyncError {
  error: boolean;
  message: string;
  statusCode?: number;
}
