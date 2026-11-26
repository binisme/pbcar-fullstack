import React from 'react';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle | null;
  testMode: boolean;
  onSelect: (minutes: 15 | 30) => void;
  onClose: () => void;
}

export const PackageModal: React.FC<Props> = ({ vehicle, testMode, onSelect, onClose }) => {
  if (!vehicle) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-4 text-white text-center">
          <div className="text-xs font-semibold uppercase text-sky-100">Bắt đầu bấm giờ</div>
          <h3 className="text-xl font-black mt-0.5">Chọn gói dịch vụ - {vehicle.name}</h3>
        </div>

        <div className="p-5 space-y-3">
          {testMode && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-3 py-2 text-xs font-bold text-center">
              ⚡ Chế độ Test: 15p = 5s • 30p = 10s (Không tính doanh thu & lượt)
            </div>
          )}

          <button
            onClick={() => onSelect(15)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 active:scale-[0.98]"
          >
            <div className="text-left">
              <div className="text-lg font-extrabold text-emerald-900">Gói 15 phút</div>
              <div className="text-xs text-emerald-700">Tiêu chuẩn công viên</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-emerald-700">50.000đ</div>
              <span className="text-[11px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">50k</span>
            </div>
          </button>

          <button
            onClick={() => onSelect(30)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50 border-2 border-blue-500 active:scale-[0.98]"
          >
            <div className="text-left">
              <div className="text-lg font-extrabold text-blue-900">Gói 30 phút</div>
              <div className="text-xs text-blue-700">Tiết kiệm hơn 20k</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-blue-700">80.000đ</div>
              <span className="text-[11px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">80k</span>
            </div>
          </button>

          <button onClick={onClose} className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};
