import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Vehicle } from '../types';

interface Props {
  vehicles: Vehicle[];
  onAdd: () => void;
  onRemove: (v: Vehicle) => void;
  onResetToday: () => void;
}

export const VehiclesManageView: React.FC<Props> = ({ vehicles, onAdd, onRemove, onResetToday }) => (
  <div className="bg-white/95 rounded-2xl p-4 shadow-md border border-sky-200 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
        Quản Lý Danh Sách Xe ({vehicles.length} xe)
      </h2>
      <div className="flex gap-2">
        <button onClick={onAdd} className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95">
          + Thêm xe
        </button>
        <button onClick={onResetToday} className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-2 rounded-xl active:scale-95">
          Reset số trên thẻ
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {vehicles.map((v) => (
        <div key={v.id} className="p-3 rounded-xl border bg-slate-50 flex items-center justify-between">
          <div>
            <div className="font-extrabold text-sm text-slate-800">{v.name}</div>
            <div className="text-[11px] text-slate-500">Today: {v.todayCount} lượt</div>
          </div>
          <button
            disabled={v.status !== 'idle'}
            onClick={() => onRemove(v)}
            className={`p-1.5 rounded-lg ${v.status !== 'idle' ? 'text-slate-300' : 'text-red-500 hover:bg-red-100'}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);
