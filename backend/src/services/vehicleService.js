import { PACKAGES } from '../config/env.js';
import { getVNDateParts } from '../utils/dateHelper.js';
import {
  getStore,
  ensureCurrentDay,
  recalculateTodayVehicleCounts,
  saveMainStateToFirebase,
  saveHistoryItemToFirebase,
} from './parkStore.js';

export function getPublicState() {
  const store = getStore();
  const today = getVNDateParts();

  return {
    serverTime: Date.now(),
    dateKey: today.dateKey,
    displayDate: today.displayDate,
    firebaseConnected: store.ready,
    vehicles: store.vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      status: v.status,
      todayCount: Number(v.todayCount) || 0,
      packageMinutes: v.packageMinutes,
      totalMinutes: Number(v.totalMinutes) || 0,
      extensionCount: Array.isArray(v.extensions) ? v.extensions.length : 0,
      price: Number(v.price) || 0,
      startTime: v.startTime,
      endTime: v.endTime,
      currentSessionId: v.currentHistoryId,
      isTestRun: Boolean(v.isTestRun),
    })),
    settings: { ...store.settings },
  };
}

export async function startVehicle(vehicleId, minutes) {
  const pkg = PACKAGES[Number(minutes)];
  if (!pkg) {
    const err = new Error('Gói dịch vụ không hợp lệ (chỉ hỗ trợ 15 hoặc 30 phút)');
    err.status = 400;
    throw err;
  }

  await ensureCurrentDay(false);
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    const err = new Error('Không tìm thấy xe');
    err.status = 404;
    throw err;
  }
  if (vehicle.status !== 'idle') {
    const err = new Error(`${vehicle.name} đang chạy hoặc chờ xác nhận`);
    err.status = 409;
    throw err;
  }

  const now = Date.now();
  const today = getVNDateParts(new Date(now));
  const isTest = Boolean(store.settings.testMode);
  const durationMs = isTest ? pkg.testSeconds * 1000 : pkg.minutes * 60 * 1000;
  const effectivePrice = isTest ? 0 : pkg.price;

  const historyItem = {
    id: `${now}-${vehicle.id}`,
    dateStr: today.displayDate,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    packageMinutes: pkg.minutes,
    totalMinutes: pkg.minutes,
    extensions: [],
    packageLabel: isTest ? `TEST ${pkg.testSeconds}s` : `${pkg.minutes} phút`,
    price: effectivePrice,
    startTime: now,
    endTime: null,
    status: 'Đang chạy',
    isTest,
  };

  vehicle.status = 'running';
  vehicle.packageMinutes = pkg.minutes;
  vehicle.totalMinutes = pkg.minutes;
  vehicle.extensions = [];
  vehicle.price = effectivePrice;
  vehicle.startTime = now;
  vehicle.endTime = now + durationMs;
  vehicle.currentHistoryId = historyItem.id;
  vehicle.isTestRun = isTest;

  store.history.unshift(historyItem);
  recalculateTodayVehicleCounts();

  await Promise.all([
    saveMainStateToFirebase(),
    saveHistoryItemToFirebase(historyItem),
  ]);

  return getPublicState();
}

export async function extendVehicle(vehicleId, addMinutes) {
  const pkg = PACKAGES[Number(addMinutes)];
  if (!pkg) {
    const err = new Error('Gói gia hạn không hợp lệ');
    err.status = 400;
    throw err;
  }

  await ensureCurrentDay(false);
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    const err = new Error('Không tìm thấy xe');
    err.status = 404;
    throw err;
  }
  if (vehicle.status !== 'running' && vehicle.status !== 'expired') {
    const err = new Error(`${vehicle.name} chưa chạy nên không thể gia hạn`);
    err.status = 409;
    throw err;
  }

  const now = Date.now();
  const isTestExt = Boolean(store.settings.testMode || vehicle.isTestRun);
  const addMs = isTestExt ? pkg.testSeconds * 1000 : pkg.minutes * 60 * 1000;
  const effectiveAddPrice = isTestExt ? 0 : pkg.price;

  // Cộng dồn liên tục vào thời gian cũ
  const baseEnd = vehicle.status === 'running' && vehicle.endTime && vehicle.endTime > now
    ? vehicle.endTime
    : now;

  vehicle.status = 'running';
  vehicle.endTime = baseEnd + addMs;
  vehicle.totalMinutes = (vehicle.totalMinutes || vehicle.packageMinutes || 0) + pkg.minutes;
  vehicle.price = (vehicle.price || 0) + effectiveAddPrice;
  if (!Array.isArray(vehicle.extensions)) vehicle.extensions = [];
  vehicle.extensions.push({
    minutes: pkg.minutes,
    price: effectiveAddPrice,
    time: now,
    isTest: isTestExt,
  });

  let updatedHistory = null;
  if (vehicle.currentHistoryId) {
    const h = store.history.find((item) => item.id === vehicle.currentHistoryId);
    if (h) {
      if (!Array.isArray(h.extensions)) h.extensions = [];
      h.extensions.push({
        minutes: pkg.minutes,
        price: effectiveAddPrice,
        time: now,
        isTest: isTestExt,
      });
      h.totalMinutes = (h.totalMinutes || h.packageMinutes || 0) + pkg.minutes;
      h.price = (h.price || 0) + effectiveAddPrice;
      h.status = 'Đang chạy';
      h.endTime = null;

      if (h.isTest) {
        h.packageLabel = `TEST (+${pkg.testSeconds}s)`;
      } else {
        const parts = [
          `${h.packageMinutes}p`,
          ...h.extensions.map((ext) => (ext.isTest ? 'TEST' : `${ext.minutes}p`)),
        ];
        h.packageLabel = `${parts.join(' + ')} (Gia hạn)`;
      }
      updatedHistory = h;
    }
  }

  recalculateTodayVehicleCounts();

  const tasks = [saveMainStateToFirebase()];
  if (updatedHistory) tasks.push(saveHistoryItemToFirebase(updatedHistory));
  await Promise.all(tasks);

  return getPublicState();
}

export async function finishVehicle(vehicleId, mode = 'stop') {
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    const err = new Error('Không tìm thấy xe');
    err.status = 404;
    throw err;
  }

  const now = Date.now();
  let updatedHistory = null;

  if (vehicle.currentHistoryId) {
    const h = store.history.find((item) => item.id === vehicle.currentHistoryId);
    if (h) {
      h.endTime = h.endTime || now;
      h.status = mode === 'confirm' || vehicle.status === 'expired' ? 'Hoàn thành' : 'Dừng sớm';
      updatedHistory = h;
    }
  }

  vehicle.status = 'idle';
  vehicle.packageMinutes = null;
  vehicle.totalMinutes = 0;
  vehicle.extensions = [];
  vehicle.price = 0;
  vehicle.startTime = null;
  vehicle.endTime = null;
  vehicle.currentHistoryId = null;
  vehicle.isTestRun = false;

  const tasks = [saveMainStateToFirebase()];
  if (updatedHistory) tasks.push(saveHistoryItemToFirebase(updatedHistory));
  await Promise.all(tasks);

  return getPublicState();
}

export async function addVehicle() {
  const store = getStore();
  const maxId = store.vehicles.reduce((max, v) => Math.max(max, v.id), 0);
  const nextId = maxId + 1;
  const name = `Xe${String(nextId).padStart(2, '0')}`;

  store.vehicles.push({
    id: nextId,
    name,
    status: 'idle',
    todayCount: 0,
    packageMinutes: null,
    totalMinutes: 0,
    extensions: [],
    price: 0,
    startTime: null,
    endTime: null,
    currentHistoryId: null,
    isTestRun: false,
  });

  await saveMainStateToFirebase();
  return { addedName: name, state: getPublicState() };
}

export async function removeVehicle(vehicleId) {
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) {
    const err = new Error('Không tìm thấy xe');
    err.status = 404;
    throw err;
  }
  if (vehicle.status !== 'idle') {
    const err = new Error('Chỉ có thể xóa xe đang ở trạng thái XE CHỜ');
    err.status = 409;
    throw err;
  }

  store.vehicles = store.vehicles.filter((v) => v.id !== vehicleId);
  await saveMainStateToFirebase();
  return { removedName: vehicle.name, state: getPublicState() };
}

export async function resetTodayCardCounters() {
  const store = getStore();
  store.dateStr = getVNDateParts().displayDate;
  store.dailyResetAt = Date.now();
  for (const v of store.vehicles) v.todayCount = 0;
  await saveMainStateToFirebase();
  return getPublicState();
}

export async function updateSettings(payload = {}) {
  const store = getStore();
  if (payload.soundEnabled !== undefined) store.settings.soundEnabled = Boolean(payload.soundEnabled);
  if (payload.voiceEnabled !== undefined) store.settings.voiceEnabled = Boolean(payload.voiceEnabled);
  if (payload.testMode !== undefined) store.settings.testMode = Boolean(payload.testMode);

  await saveMainStateToFirebase();
  return getPublicState();
}

/**
 * Server Ticker chạy mỗi 1 giây: kiểm tra xe hết giờ & tự reset khi sang ngày mới
 */
export async function processBackgroundTick() {
  const store = getStore();
  if (!store.ready) return false;

  const dayChanged = await ensureCurrentDay(true);
  const now = Date.now();
  let expiredChanged = false;
  const expiredHistories = [];

  for (const v of store.vehicles) {
    if (v.status === 'running' && v.endTime && v.endTime <= now) {
      v.status = 'expired';
      expiredChanged = true;

      if (v.currentHistoryId) {
        const h = store.history.find((item) => item.id === v.currentHistoryId);
        if (h) {
          h.endTime = v.endTime || now;
          h.status = 'Hoàn thành';
          expiredHistories.push(h);
        }
      }
    }
  }

  if (expiredChanged) {
    const tasks = [saveMainStateToFirebase()];
    for (const h of expiredHistories) tasks.push(saveHistoryItemToFirebase(h));
    await Promise.all(tasks);
  }

  return dayChanged || expiredChanged;
}
