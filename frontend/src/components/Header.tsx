import React from 'react';
import { Bell, Car, Timer, Volume2, VolumeX } from 'lucide-react';
import type { ParkState, TabName } from '../types';

interface Props {
  parkState: ParkState;
  connected: boolean;
  onToggleTest: () => void;
  onToggleSound: () => void;
  onSwitchTab: (tab: TabName) => void;
}

export const Header: React.FC<Props> = ({
  parkState,
  connected,
  onToggleTest,
  onToggleSound,
  onSwitchTab,
}) => {
  const expiredNames = parkState.vehicles.filter((v) => v.status === 'expired').map((v) => v.name);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-sky-500/95 via-sky-400/95 to-sky-400/85 backdrop-blur-md shadow-sm border-b border-white/40 px-3 pb-2">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-full shadow-sm border border-sky-200 shrink-0">
              <Car className="w-4 h-4 text-emerald-600" />
              <span className="font-black text-xs sm:text-sm bg-gradient-to-r from-blue-700 to-emerald-600 bg-clip-text text-transparent">
                PBCAR PARK
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-[11px] font-bold text-slate-600">
              <span className={`w-2 h-2 rounded-full ${connected && parkState.firebaseConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>{connected ? (parkState.firebaseConnected ? 'Firebase Realtime' : 'BE Online') : 'Mất kết nối'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleTest}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold border shadow-sm active:scale-95 transition ${
                parkState.settings.testMode
                  ? 'bg-amber-400 text-amber-950 border-amber-200'
                  : 'bg-white/85 text-slate-600 border-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{parkState.settings.testMode ? 'Test 5s: BẬT' : 'Test 5s: TẮT'}</span>
            </button>

            <button
              onClick={onToggleSound}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border active:scale-95 ${
                parkState.settings.soundEnabled ? 'bg-white text-blue-600 border-white' : 'bg-red-100 text-red-600 border-red-200'
              }`}
            >
              {parkState.settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="text-center leading-tight">
          <div className="text-red-600 font-extrabold text-sm sm:text-base drop-shadow-sm">
            Today: {parkState.displayDate}
          </div>
          <h1 className="text-slate-900 font-black text-[15px] sm:text-xl uppercase tracking-tight">
            HỆ THỐNG QUẢN LÝ XE ĐIỆN CÔNG VIÊN
          </h1>
        </div>

        {parkState.settings.testMode && (
          <div className="mt-1.5 bg-amber-400 text-amber-950 rounded-xl px-3 py-1.5 text-xs font-extrabold flex items-center justify-between">
            <span>⚡ Đang bật TEST 5s — KHÔNG tính doanh thu & KHÔNG tăng số lượt</span>
            <button onClick={onToggleTest} className="bg-amber-950 text-white px-2 py-0.5 rounded-lg text-[11px]">
              Tắt
            </button>
          </div>
        )}

        {expiredNames.length > 0 && (
          <div className="mt-2 bg-red-600 text-white rounded-xl px-3 py-2 shadow-md border border-red-300 flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold truncate">
                HẾT GIỜ: {expiredNames.join(', ')} — Vui lòng thu xe!
              </span>
            </div>
            <button
              onClick={() => onSwitchTab('home')}
              className="shrink-0 bg-white text-red-600 font-extrabold text-xs px-2.5 py-1 rounded-lg"
            >
              Xem ngay
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
