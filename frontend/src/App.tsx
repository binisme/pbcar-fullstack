import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { HistoryView } from './components/HistoryView';
import { PackageModal } from './components/PackageModal';
import { ReportView } from './components/ReportView';
import { RunningActionModal } from './components/RunningActionModal';
import { SettingsView } from './components/SettingsView';
import { VehicleCard } from './components/VehicleCard';
import { VehiclesManageView } from './components/VehiclesManageView';
import { useParkSystem } from './hooks/useParkSystem';
import type { TabName } from './types';

export default function App() {
  const { parkState, connected, nowMs, toast, actions } = useParkSystem();
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [startVehicleId, setStartVehicleId] = useState<number | null>(null);
  const [actionVehicleId, setActionVehicleId] = useState<number | null>(null);

  if (!parkState) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-700">
        Đang kết nối hệ thống xe điện PBCAR...
      </div>
    );
  }

  const startTarget = parkState.vehicles.find((v) => v.id === startVehicleId) || null;
  const actionTarget = parkState.vehicles.find((v) => v.id === actionVehicleId) || null;

  const idleCount = parkState.vehicles.filter((v) => v.status === 'idle').length;
  const runningCount = parkState.vehicles.filter((v) => v.status === 'running').length;
  const expiredCount = parkState.vehicles.filter((v) => v.status === 'expired').length;

  return (
    <>
      <Header
        parkState={parkState}
        connected={connected}
        onToggleTest={() => actions.updateSettings({ testMode: !parkState.settings.testMode })}
        onToggleSound={() => actions.updateSettings({ soundEnabled: !parkState.settings.soundEnabled })}
        onSwitchTab={setActiveTab}
      />

      <main className="max-w-5xl mx-auto px-2 sm:px-4 pt-3 pb-6">
        {activeTab === 'home' && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/90 rounded-xl px-2.5 py-1.5 flex justify-between shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Đang chờ</span>
                <span className="font-extrabold text-emerald-600">{idleCount}</span>
              </div>
              <div className="bg-white/90 rounded-xl px-2.5 py-1.5 flex justify-between shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Đang chạy</span>
                <span className="font-extrabold text-amber-600">{runningCount}</span>
              </div>
              <div className="bg-white/90 rounded-xl px-2.5 py-1.5 flex justify-between shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Hết giờ</span>
                <span className="font-extrabold text-red-600">{expiredCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {parkState.vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  nowMs={nowMs}
                  onStartClick={(car) => setStartVehicleId(car.id)}
                  onActionClick={(car) => setActionVehicleId(car.id)}
                  onConfirmExpired={(car) => actions.confirmVehicle(car.id)}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'report' && <ReportView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'vehicles' && (
          <VehiclesManageView
            vehicles={parkState.vehicles}
            onAdd={actions.addVehicle}
            onRemove={(v) => actions.removeVehicle(v.id)}
            onResetToday={actions.resetTodayCounters}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView
            settings={parkState.settings}
            firebaseConnected={parkState.firebaseConnected}
            onUpdate={actions.updateSettings}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      <PackageModal
        vehicle={startTarget}
        testMode={parkState.settings.testMode}
        onSelect={async (minutes) => {
          if (startTarget) {
            await actions.startVehicle(startTarget.id, minutes);
            setStartVehicleId(null);
          }
        }}
        onClose={() => setStartVehicleId(null)}
      />

      <RunningActionModal
        vehicle={actionTarget}
        nowMs={nowMs}
        testMode={parkState.settings.testMode}
        onExtend={async (minutes) => {
          if (actionTarget) {
            await actions.extendVehicle(actionTarget.id, minutes);
            setActionVehicleId(null);
          }
        }}
        onStopNow={async () => {
          if (actionTarget) {
            await actions.stopVehicle(actionTarget.id);
            setActionVehicleId(null);
          }
        }}
        onClose={() => setActionVehicleId(null)}
      />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-xl">
          {toast.text}
        </div>
      )}
    </>
  );
}
