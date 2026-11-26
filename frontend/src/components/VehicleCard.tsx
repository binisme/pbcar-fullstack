import React from 'react';
import type { Vehicle } from '../types';
import { formatCountdown } from '../utils/format';

interface Props {
  vehicle: Vehicle;
  nowMs: number;
  onStartClick: (v: Vehicle) => void;
  onActionClick: (v: Vehicle) => void;
  onConfirmExpired: (v: Vehicle) => void;
}

export const VehicleCard: React.FC<Props> = ({
  vehicle,
  nowMs,
  onStartClick,
  onActionClick,
  onConfirmExpired,
}) => {
  if (vehicle.status === 'expired') {
    return (
      <div className="expired-card-pulse rounded-2xl border-2 border-red-900 p-2 sm:p-2.5 flex flex-col items-center justify-between text-center shadow-lg text-white">
        <div className="text-lg sm:text-xl font-black leading-tight">{vehicle.name}</div>
        <div className="w-full my-1.5 py-1 rounded-full bg-yellow-300 text-red-900 font-black text-[11px] sm:text-xs">
          {vehicle.isTestRun ? 'KẾT THÚC (TEST)' : 'KẾT THÚC'}
        </div>
        <div className="text-[11px] font-bold text-red-100 mb-1.5">
          Today: <span className="text-white font-black">{vehicle.todayCount}</span>
        </div>
        <div className="w-full flex gap-1">
          <button
            onClick={() => onActionClick(vehicle)}
            className="flex-1 py-2 rounded-xl bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs active:scale-95"
          >
            GIA HẠN
          </button>
          <button
            onClick={() => onConfirmExpired(vehicle)}
            className="flex-1 py-2 rounded-xl bg-white text-red-600 font-black text-[10px] sm:text-xs active:scale-95"
          >
            XÁC NHẬN
          </button>
        </div>
      </div>
    );
  }

  if (vehicle.status === 'running') {
    const remaining = (vehicle.endTime || nowMs) - nowMs;
    const priceK = Math.round(vehicle.price / 1000);
    const label = vehicle.isTestRun
      ? 'CHẠY TEST (0đ)'
      : vehicle.extensionCount > 0
        ? `${vehicle.totalMinutes}p (GH) - ${priceK}k`
        : `${vehicle.totalMinutes}p - ${priceK}k`;

    return (
      <div className={`bg-white rounded-2xl border-2 ${vehicle.isTestRun ? 'border-purple-400' : 'border-amber-400'} p-2 sm:p-2.5 flex flex-col items-center justify-between text-center shadow-md`}>
        <div className="text-base sm:text-lg font-extrabold text-slate-800">{vehicle.name}</div>
        <div className={`w-full my-1.5 py-1 rounded-full ${vehicle.isTestRun ? 'bg-purple-600' : 'bg-amber-500'} text-white font-mono font-black text-sm sm:text-base`}>
          {formatCountdown(remaining)}
        </div>
        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md mb-1 truncate max-w-full ${vehicle.isTestRun ? 'bg-purple-50 text-purple-800' : 'bg-amber-50 text-amber-800'}`}>
          {label}
        </div>
        <div className="text-[11px] text-slate-500 mb-1.5">
          Today: <span className="font-extrabold text-slate-800">{vehicle.todayCount}</span>
        </div>
        <button
          onClick={() => onActionClick(vehicle)}
          className="w-full py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-[10px] sm:text-xs active:scale-95"
        >
          DỪNG / GIA HẠN
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-400/80 p-2 sm:p-2.5 flex flex-col items-center justify-between text-center shadow-sm">
      <div className="text-base sm:text-lg font-extrabold text-slate-800">{vehicle.name}</div>
      <div className="w-full my-1.5 py-1 rounded-full bg-emerald-700 text-white font-bold text-[11px] sm:text-xs">
        XE CHỜ
      </div>
      <div className="text-[11px] text-slate-500 mb-1.5">
        Today: <span className="font-extrabold text-slate-800">{vehicle.todayCount}</span>
      </div>
      <button
        onClick={() => onStartClick(vehicle)}
        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] sm:text-xs active:scale-95"
      >
        BẮT ĐẦU
      </button>
    </div>
  );
};
