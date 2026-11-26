import React, { useEffect, useState } from 'react';
import { parkApi } from '../services/api';
import type { HistoryResponse, TimeScope } from '../types';
import { formatTime, formatVND, getTodayInputDate, getTodayInputMonth } from '../utils/format';

export const HistoryView: React.FC = () => {
  const [scope, setScope] = useState<TimeScope>('today');
  const [selectedDate, setSelectedDate] = useState(getTodayInputDate());
  const [selectedMonth, setSelectedMonth] = useState(getTodayInputMonth());
  const [includeTest, setIncludeTest] = useState(false);
  const [data, setData] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    parkApi.getHistory(scope, selectedDate, selectedMonth, includeTest).then(setData).catch(console.error);
  }, [scope, selectedDate, selectedMonth, includeTest]);

  return (
    <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-sky-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Lịch Sử Lượt Chạy</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['today', 'day', 'month'] as TimeScope[]).map((m) => (
              <button
                key={m}
                onClick={() => setScope(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  scope === m ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                {m === 'today' ? 'Hôm nay' : m === 'day' ? 'Theo ngày' : 'Theo tháng'}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold bg-slate-100 px-2.5 py-1.5 rounded-full">
            {data?.totalRealTurns ?? 0} lượt
          </span>
        </div>
      </div>

      {scope === 'day' && (
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm font-bold"
        />
      )}
      {scope === 'month' && (
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm font-bold"
        />
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Không tính lượt Test vào tổng lượt & doanh thu</span>
        <button
          onClick={() => setIncludeTest((v) => !v)}
          className={`px-2.5 py-1 rounded-lg border font-bold ${
            includeTest ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          {includeTest ? 'Đang hiện lượt Test' : 'Đang ẩn lượt Test'}
        </button>
      </div>

      <div className="space-y-2">
        {!data || data.items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có lịch sử chạy</div>
        ) : (
          data.items.map((h) => (
            <div key={h.id} className={`p-3 rounded-2xl border ${h.isTest ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="font-black text-slate-900">{h.vehicleName}</span>
                    {h.isTest ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">TEST • Không tính lượt</span>
                    ) : (
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${h.realTurns > 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>
                        {h.realTurns} lượt
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{h.packageLabel}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {h.displayDate} • Bắt đầu: <strong>{formatTime(h.startTime)}</strong>
                    {h.endTime && <> • Kết thúc: <strong>{formatTime(h.endTime)}</strong></>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-black ${h.isTest ? 'text-purple-600' : 'text-emerald-600'}`}>
                    {formatVND(h.totalPrice)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{h.status}</span>
                </div>
              </div>

              {h.extensions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>• Lượt 1 (Gói {h.packageMinutes}p ban đầu):</span>
                    <span className="font-bold">{formatVND(h.initialPrice)}</span>
                  </div>
                  {h.extensions.map((ext, i) => (
                    <div key={ext.id} className="flex justify-between text-amber-800">
                      <span>• Lượt {i + 2} (Gia hạn +{ext.minutes}p lúc {formatTime(ext.extendedAt)}):</span>
                      <span className="font-extrabold text-emerald-600">+{formatVND(ext.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
