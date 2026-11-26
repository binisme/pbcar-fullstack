import React, { useEffect, useState } from 'react';
import { parkApi } from '../services/api';
import type { RevenueReport, TimeScope } from '../types';
import { formatVND, getTodayInputDate, getTodayInputMonth, shiftDateKey, shiftMonthKey } from '../utils/format';

export const ReportView: React.FC = () => {
  const [scope, setScope] = useState<TimeScope>('today');
  const [selectedDate, setSelectedDate] = useState(getTodayInputDate());
  const [selectedMonth, setSelectedMonth] = useState(getTodayInputMonth());
  const [report, setReport] = useState<RevenueReport | null>(null);

  useEffect(() => {
    parkApi.getReport(scope, selectedDate, selectedMonth).then(setReport).catch(console.error);
  }, [scope, selectedDate, selectedMonth]);

  if (!report) {
    return <div className="bg-white/95 rounded-2xl p-6 text-center text-slate-500 font-semibold">Đang tải báo cáo...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-sky-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800">Báo Cáo Doanh Thu</h2>
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['today', 'day', 'month'] as TimeScope[]).map((m) => (
              <button
                key={m}
                onClick={() => setScope(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  scope === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                {m === 'today' ? 'Hôm nay' : m === 'day' ? 'Theo ngày' : 'Theo tháng'}
              </button>
            ))}
          </div>
        </div>

        {scope === 'day' && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <button onClick={() => setSelectedDate((d) => shiftDateKey(d, -1))} className="w-9 h-9 rounded-xl bg-white border font-black">‹</button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border rounded-xl px-3 py-1.5 text-sm font-extrabold text-center"
            />
            <button onClick={() => setSelectedDate((d) => shiftDateKey(d, 1))} className="w-9 h-9 rounded-xl bg-white border font-black">›</button>
          </div>
        )}

        {scope === 'month' && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <button onClick={() => setSelectedMonth((m) => shiftMonthKey(m, -1))} className="w-9 h-9 rounded-xl bg-white border font-black">‹</button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border rounded-xl px-3 py-1.5 text-sm font-extrabold text-center"
            />
            <button onClick={() => setSelectedMonth((m) => shiftMonthKey(m, 1))} className="w-9 h-9 rounded-xl bg-white border font-black">›</button>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl p-4 text-white">
          <div className="text-xs font-medium text-white/90">Doanh thu — {report.label}</div>
          <div className="text-3xl font-black mt-0.5">{formatVND(report.totalRevenue)}</div>
          <div className="mt-2 pt-2 border-t border-white/25 flex justify-between text-xs sm:text-sm">
            <span>Tổng lượt thực tế (không tính Test):</span>
            <span className="font-extrabold">{report.totalTurns} lượt</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
            <div className="text-xs font-bold text-sky-700">Gói 15 phút (50k)</div>
            <div className="text-xl font-black mt-1">{report.pkg15Count} gói</div>
            <div className="text-xs font-bold text-emerald-600">{formatVND(report.pkg15Revenue)}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs font-bold text-amber-700">Gói 30 phút (80k)</div>
            <div className="text-xl font-black mt-1">{report.pkg30Count} gói</div>
            <div className="text-xs font-bold text-emerald-600">{formatVND(report.pkg30Revenue)}</div>
          </div>
        </div>
      </div>

      {scope === 'month' && (
        <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-sky-200">
          <h3 className="text-sm font-extrabold text-slate-800 mb-2">Chi tiết từng ngày trong {report.label}</h3>
          <div className="divide-y divide-slate-100">
            {report.byDay.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-4">Chưa có doanh thu</div>
            ) : (
              report.byDay.map((d) => (
                <button
                  key={d.dateKey}
                  onClick={() => { setSelectedDate(d.dateKey); setScope('day'); }}
                  className="w-full flex items-center justify-between py-2.5 px-1 hover:bg-sky-50 rounded-lg text-left"
                >
                  <div>
                    <div className="font-extrabold text-sm text-slate-800">{d.displayDate}</div>
                    <div className="text-[11px] text-slate-500">{d.turns} lượt • 15p: {d.pkg15} • 30p: {d.pkg30}</div>
                  </div>
                  <div className="font-black text-emerald-600 text-sm">{formatVND(d.revenue)} ›</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-sky-200">
        <h3 className="text-sm font-extrabold text-slate-800 mb-2">Thống kê theo từng xe</h3>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {report.byVehicle.map((v) => (
            <div key={v.vehicleName} className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-12 text-center font-extrabold bg-slate-100 py-1 rounded-lg text-xs">{v.vehicleName}</span>
                <span className="text-xs text-slate-500">{v.turns} lượt</span>
              </div>
              <span className={`font-extrabold ${v.revenue > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {formatVND(v.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
