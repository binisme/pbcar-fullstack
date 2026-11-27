import { io, Socket } from 'socket.io-client';
import type { AppSettings, HistoryResponse, ParkState, RevenueReport, TimeScope } from '../types';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi kết nối máy chủ');
  }
  return data as T;
}

export const parkApi = {
  getState: () => request<ParkState>('/api/state'),

  startVehicle: (id: number, minutes: 15 | 30) =>
    request<ParkState>(`/api/vehicles/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    }),

  extendVehicle: (id: number, minutes: 15 | 30) =>
    request<ParkState>(`/api/vehicles/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    }),

  stopVehicle: (id: number) =>
    request<ParkState>(`/api/vehicles/${id}/stop`, { method: 'POST' }),

  confirmVehicle: (id: number) =>
    request<ParkState>(`/api/vehicles/${id}/confirm`, { method: 'POST' }),

  addVehicle: () =>
    request<{ addedName: string; state: ParkState }>('/api/vehicles', { method: 'POST' }),

  removeVehicle: (id: number) =>
    request<{ removedName: string; state: ParkState }>(`/api/vehicles/${id}`, { method: 'DELETE' }),

  resetTodayCounters: () =>
    request<ParkState>('/api/vehicles/reset-today', { method: 'POST' }),

  updateSettings: (payload: Partial<AppSettings>) =>
    request<ParkState>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getReport: (scope: TimeScope, date: string, month: string) => {
    const params = new URLSearchParams({ scope, date, month });
    return request<RevenueReport>(`/api/reports?${params.toString()}`);
  },

  getHistory: (scope: TimeScope, date: string, month: string, includeTest: boolean) => {
    const params = new URLSearchParams({ scope, date, month, includeTest: String(includeTest) });
    return request<HistoryResponse>(`/api/history?${params.toString()}`);
  },
};

export function createRealtimeSocket(): Socket {
  const opts = {
    transports: ['websocket', 'polling'],
    reconnection: true,
  };
  return API_BASE ? io(API_BASE, opts) : io(opts);
}
