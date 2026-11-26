import { useCallback, useEffect, useRef, useState } from 'react';
import { createRealtimeSocket, parkApi } from '../services/api';
import type { AppSettings, ParkState } from '../types';
import { initVoiceLoader, playBeepChime, speakExpiredVehicles, stopAllVoice, unlockAudio } from '../utils/audio';

export function useParkSystem() {
  const [parkState, setParkState] = useState<ParkState | null>(null);
  const [connected, setConnected] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const serverOffsetRef = useRef(0);
  const lastVoiceTimeRef = useRef(0);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2400);
  }, []);

  const applyServerState = useCallback((next: ParkState) => {
    serverOffsetRef.current = next.serverTime - Date.now();
    setParkState(next);
  }, []);

  useEffect(() => {
    initVoiceLoader();

    parkApi.getState()
      .then(applyServerState)
      .catch(() => showToast('Không thể kết nối Backend Server', 'error'));

    const socket = createRealtimeSocket();
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('park:update', (nextState: ParkState) => {
      applyServerState(nextState);
    });

    return () => {
      socket.disconnect();
    };
  }, [applyServerState, showToast]);

  useEffect(() => {
    const id = setInterval(() => {
      setNowMs(Date.now() + serverOffsetRef.current);
    }, 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const expired = parkState?.vehicles.filter((v) => v.status === 'expired') || [];
    const soundOn = parkState?.settings.soundEnabled ?? true;
    const voiceOn = parkState?.settings.voiceEnabled ?? true;

    if (expired.length === 0) {
      stopAllVoice();
      return;
    }

    const triggerAlarm = () => {
      if (soundOn) playBeepChime();
      const now = Date.now();
      if (voiceOn && now - lastVoiceTimeRef.current > 5000) {
        lastVoiceTimeRef.current = now;
        setTimeout(() => speakExpiredVehicles(expired.map((v) => v.name)), 650);
      }
    };

    triggerAlarm();
    const alarmTimer = setInterval(triggerAlarm, 3000);
    return () => clearInterval(alarmTimer);
  }, [parkState]);

  const actions = {
    startVehicle: async (id: number, minutes: 15 | 30) => {
      unlockAudio();
      const next = await parkApi.startVehicle(id, minutes);
      applyServerState(next);
      showToast(
        next.settings.testMode
          ? 'Chạy TEST (Không tính tiền & lượt)'
          : `Đã bắt đầu gói ${minutes} phút`,
        next.settings.testMode ? 'warning' : 'success'
      );
    },
    extendVehicle: async (id: number, minutes: 15 | 30) => {
      unlockAudio();
      const next = await parkApi.extendVehicle(id, minutes);
      applyServerState(next);
      showToast(`Đã gia hạn cộng dồn +${minutes} phút`, 'success');
    },
    stopVehicle: async (id: number) => {
      const next = await parkApi.stopVehicle(id);
      applyServerState(next);
      showToast('Đã dừng xe và đưa về XE CHỜ', 'info');
    },
    confirmVehicle: async (id: number) => {
      const next = await parkApi.confirmVehicle(id);
      applyServerState(next);
      showToast('Đã xác nhận thu xe thành công', 'success');
    },
    addVehicle: async () => {
      const res = await parkApi.addVehicle();
      applyServerState(res.state);
      showToast(`Đã thêm ${res.addedName}`, 'success');
    },
    removeVehicle: async (id: number) => {
      const res = await parkApi.removeVehicle(id);
      applyServerState(res.state);
      showToast(`Đã xóa ${res.removedName}`, 'info');
    },
    resetTodayCounters: async () => {
      const next = await parkApi.resetTodayCounters();
      applyServerState(next);
      showToast('Đã reset số Today trên thẻ về 0', 'success');
    },
    updateSettings: async (patch: Partial<AppSettings>) => {
      unlockAudio();
      const next = await parkApi.updateSettings(patch);
      applyServerState(next);
    },
  };

  return { parkState, connected, nowMs, toast, showToast, actions };
}
