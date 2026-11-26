import React from 'react';
import type { Vehicle } from '../types';
import { formatCountdown } from '../utils/format';

interface Props {
  vehicle: Vehicle | null;
  nowMs: number;
  testMode: boolean;
  onExtend: (minutes: 15 | 30) => void;
  onStopNow: () => void;
  onClose: () => void;
}

export const RunningActionModal: React.FC<Props> = ({
  vehicle,
  nowMs,
  testMode,
  onExtend,
  onStopNow,
  onClose,
}) => {
  if (!vehicle) return null;
  const countdownText =
    vehicle.status === 'expired'
      ? '00:00 (Hết giờ)'
      : formatCountdown((vehicle.endTime || nowMs) - nowMs);

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white text-center">
          <div className="text-xs font-semibold uppercase text-amber-100">Quản lý xe</div>
          <h3 className="text-2xl font-black mt-0.5">{vehicle.name}</h3>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-black/20 px-3.5 py-1 rounded-full font-mono font-black text-base">
            {countdownText}
          </div>
        </div>

        <div className="p-5 space-y-3">
          {(testMode || vehicle.isTestRun) && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-3 py-2 text-xs font-bold text-center">
              ⚡ Gia hạn TEST (Không tính doanh thu & lượt)
            </div>
          )}

          <div className="text-xs font-extrabold uppercase text-slate-500">Gia hạn cộng dồn liên tục</div>

          <button
            onClick={() => onExtend(15)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 active:scale-[0.98]"
          >
            <div className="text-left">
              <div className="font-extrabold text-emerald-900">+15 phút</div>
              <div className="text-[11px] text-emerald-700">Cộng tiếp vào thời gian cũ</div>
            </div>
            <div className="font-black text-emerald-700 text-lg">50.000đ</div>
          </button>

          <button
            onClick={() => onExtend(30)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-500 active:scale-[0.98]"
          >
            <div className="text-left">
              <div className="font-extrabold text-blue-900">+30 phút</div>
              <div className="text-[11px] text-blue-700">Cộng tiếp vào thời gian cũ</div>
            </div>
            <div className="font-black text-blue-700 text-lg">80.000đ</div>
          </button>

          <div className="border-t border-slate-200 pt-3">
            <button
              onClick={onStopNow}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm active:scale-[0.98]"
            >
              Dừng xe ngay
            </button>
          </div>

          <button onClick={onClose} className="w-full py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
