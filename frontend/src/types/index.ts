export type VehicleStatus = 'idle' | 'running' | 'expired';
export type TabName = 'home' | 'report' | 'history' | 'vehicles' | 'settings';
export type TimeScope = 'today' | 'day' | 'month';

export interface Vehicle {
  id: number;
  name: string;
  status: VehicleStatus;
  todayCount: number;
  packageMinutes: number | null;
  totalMinutes: number;
  extensionCount: number;
  price: number;
  startTime: number | null;
  endTime: number | null;
  currentSessionId: string | null;
  isTestRun: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  voiceEnabled: boolean;
  testMode: boolean;
}

export interface ParkState {
  serverTime: number;
  dateKey: string;
  displayDate: string;
  firebaseConnected: boolean;
  vehicles: Vehicle[];
  settings: AppSettings;
}

export interface ReportVehicleStat {
  vehicleName: string;
  turns: number;
  revenue: number;
}

export interface ReportDayStat {
  dateKey: string;
  displayDate: string;
  turns: number;
  revenue: number;
  pkg15: number;
  pkg30: number;
}

export interface RevenueReport {
  scope: TimeScope;
  dateKey: string;
  monthKey: string;
  label: string;
  totalRevenue: number;
  totalTurns: number;
  pkg15Count: number;
  pkg15Revenue: number;
  pkg30Count: number;
  pkg30Revenue: number;
  byVehicle: ReportVehicleStat[];
  byDay: ReportDayStat[];
}

export interface SessionExtension {
  id: number;
  minutes: number;
  price: number;
  extendedAt: number;
  isTest: boolean;
}

export interface HistoryItem {
  id: string;
  vehicleId: number;
  vehicleName: string;
  dateKey: string;
  displayDate: string;
  packageMinutes: number;
  totalMinutes: number;
  packageLabel: string;
  initialPrice: number;
  totalPrice: number;
  realTurns: number;
  startTime: number;
  endTime: number | null;
  status: 'Đang chạy' | 'Hoàn thành' | 'Dừng sớm';
  isTest: boolean;
  extensions: SessionExtension[];
}

export interface HistoryResponse {
  scope: TimeScope;
  totalRealTurns: number;
  items: HistoryItem[];
}
