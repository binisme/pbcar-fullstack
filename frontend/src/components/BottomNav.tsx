import React from 'react';
import { BarChart3, Bike, History, Home, Settings } from 'lucide-react';
import type { TabName } from '../types';

interface Props {
  activeTab: TabName;
  onChange: (tab: TabName) => void;
}

const ITEMS: { id: TabName; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'report', label: 'Report', Icon: BarChart3 },
  { id: 'history', label: 'History', Icon: History },
  { id: 'vehicles', label: 'Vehicles', Icon: Bike },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export const BottomNav: React.FC<Props> = ({ activeTab, onChange }) => (
  <nav className="bottom-nav fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
    <div className="max-w-5xl mx-auto grid grid-cols-5 h-16">
      {ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex flex-col items-center justify-center gap-0.5 ${
            activeTab === id ? 'text-blue-600 font-bold' : 'text-slate-500 font-semibold'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[11px]">{label}</span>
        </button>
      ))}
    </div>
  </nav>
);
