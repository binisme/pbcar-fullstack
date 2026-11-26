import React from 'react';
import type { AppSettings } from '../types';
import { playBeepChime, speakExpiredVehicles, unlockAudio } from '../utils/audio';

interface Props {
  settings: AppSettings;
  firebaseConnected: boolean;
  onUpdate: (patch: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<Props> = ({ settings, firebaseConnected, onUpdate }) => {
  const handleTestAudio = () => {
    unlockAudio();
    playBeepChime();
    if (settings.voiceEnabled) {
      setTimeout(() => speakExpiredVehicles(['Xe01']), 650);
    }
  };

  return (
    <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-sky-200 space-y-3">
      <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Cài Đặt Hệ Thống</h2>

      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
        <div>
          <div className="text-sm font-extrabold text-emerald-900">Database Firebase (ebike-c0a0b)</div>
          <div className="text-xs text-emerald-700">Dùng chung dữ liệu với ứng dụng hiện tại, lưu trữ vĩnh viễn</div>
        </div>
        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full text-white ${firebaseConnected ? 'bg-emerald-600' : 'bg-amber-500'}`}>
          {firebaseConnected ? 'Đang kết nối' : 'Đang đồng bộ'}
        </span>
      </div>

      <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border cursor-pointer">
        <div>
          <div className="text-sm font-bold">Âm thanh chuông cảnh báo</div>
          <div className="text-xs text-slate-500">Phát chuông lặp lại khi xe hết giờ</div>
        </div>
        <input
          type="checkbox"
          checked={settings.soundEnabled}
          onChange={(e) => onUpdate({ soundEnabled: e.target.checked })}
          className="w-5 h-5 accent-blue-600"
        />
      </label>

      <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border cursor-pointer">
        <div>
          <div className="text-sm font-bold">Giọng đọc tiếng Việt (xe + số)</div>
          <div className="text-xs text-slate-500">Đọc tự nhiên "xe 1 đã hết giờ"</div>
        </div>
        <input
          type="checkbox"
          checked={settings.voiceEnabled}
          onChange={(e) => onUpdate({ voiceEnabled: e.target.checked })}
          className="w-5 h-5 accent-blue-600"
        />
      </label>

      <label className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
        <div>
          <div className="text-sm font-bold text-amber-900">Chế độ Test nhanh (5 giây)</div>
          <div className="text-xs text-amber-700">Không tính vào doanh thu & không tăng số lượt</div>
        </div>
        <input
          type="checkbox"
          checked={settings.testMode}
          onChange={(e) => onUpdate({ testMode: e.target.checked })}
          className="w-5 h-5 accent-amber-500"
        />
      </label>

      <button
        onClick={handleTestAudio}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl active:scale-95"
      >
        Thử âm thanh chuông & giọng đọc (Mở loa iPhone)
      </button>
    </div>
  );
};
