import { getDoc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { getStateDocRef, getHistoryColRef, getHistoryDocRef } from '../config/firebase.js';
import { getVNDateParts, timestampToVNDateStr } from '../utils/dateHelper.js';

export function createDefaultVehicles(count = 24) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      name: `Xe${String(i).padStart(2, '0')}`,
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
  }
  return list;
}

const store = {
  ready: false,
  dateStr: getVNDateParts().displayDate,
  dailyResetAt: null,
  vehicles: createDefaultVehicles(24),
  history: [],
  settings: {
    soundEnabled: true,
    voiceEnabled: true,
    testMode: false,
  },
};

let onChangeListeners = [];

export function subscribeStoreChange(fn) {
  onChangeListeners.push(fn);
}

function notifyStoreListeners() {
  for (const fn of onChangeListeners) {
    try {
      fn();
    } catch (err) {
      console.error('Lỗi listener:', err);
    }
  }
}

export function getStore() {
  return store;
}

/**
 * Tính lại bộ đếm Today thực tế của từng xe (chỉ ngày hôm nay, KHÔNG tính lượt Test)
 */
export function recalculateTodayVehicleCounts() {
  const todayStr = getVNDateParts().displayDate;
  const resetCutoff = store.dateStr === todayStr && store.dailyResetAt
    ? Number(store.dailyResetAt)
    : 0;

  const countsById = {};
  const countsByName = {};

  for (const h of store.history) {
    if (!h || h.isTest) continue;
    const hDate = h.dateStr || timestampToVNDateStr(h.startTime);
    if (hDate !== todayStr) continue;

    let turns = 0;
    if (!resetCutoff || (h.startTime || 0) >= resetCutoff) turns += 1;

    const exts = Array.isArray(h.extensions) ? h.extensions : [];
    for (const ext of exts) {
      if (ext && ext.isTest) continue;
      if (!resetCutoff || (ext.time || h.startTime || 0) >= resetCutoff) turns += 1;
    }

    if (turns > 0) {
      if (h.vehicleId != null) countsById[h.vehicleId] = (countsById[h.vehicleId] || 0) + turns;
      if (h.vehicleName) countsByName[h.vehicleName] = (countsByName[h.vehicleName] || 0) + turns;
    }
  }

  let changed = false;
  for (const v of store.vehicles) {
    const computed = countsById[v.id] ?? countsByName[v.name] ?? 0;
    if (v.todayCount !== computed) {
      v.todayCount = computed;
      changed = true;
    }
  }
  return changed;
}

/**
 * Kiểm tra chuyển sang ngày mới (00:00 giờ VN) -> tự reset Today về 0
 */
export async function ensureCurrentDay(shouldPersist = true) {
  const todayStr = getVNDateParts().displayDate;
  let dayChanged = false;

  if (store.dateStr !== todayStr) {
    store.dateStr = todayStr;
    store.dailyResetAt = null;
    for (const v of store.vehicles) v.todayCount = 0;
    dayChanged = true;
  }

  const countChanged = recalculateTodayVehicleCounts();
  if (dayChanged && shouldPersist) {
    await saveMainStateToFirebase();
  }
  return dayChanged || countChanged;
}

export async function saveMainStateToFirebase() {
  const payload = {
    dateStr: store.dateStr || getVNDateParts().displayDate,
    dailyResetAt: store.dailyResetAt ?? null,
    vehicles: store.vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      status: v.status,
      todayCount: Number(v.todayCount) || 0,
      packageMinutes: v.packageMinutes ?? null,
      totalMinutes: Number(v.totalMinutes) || 0,
      extensions: Array.isArray(v.extensions) ? v.extensions : [],
      price: Number(v.price) || 0,
      startTime: v.startTime ?? null,
      endTime: v.endTime ?? null,
      currentHistoryId: v.currentHistoryId ?? null,
      isTestRun: Boolean(v.isTestRun),
    })),
    settings: {
      soundEnabled: Boolean(store.settings.soundEnabled),
      voiceEnabled: Boolean(store.settings.voiceEnabled),
      testMode: Boolean(store.settings.testMode),
    },
    updatedAt: Date.now(),
  };

  await setDoc(getStateDocRef(), payload, { merge: true });
}

export async function saveHistoryItemToFirebase(item) {
  if (!item || !item.id) return;
  const cleanItem = {
    id: String(item.id),
    dateStr: item.dateStr || getVNDateParts().displayDate,
    vehicleId: item.vehicleId,
    vehicleName: item.vehicleName,
    packageMinutes: Number(item.packageMinutes) || 15,
    totalMinutes: Number(item.totalMinutes) || Number(item.packageMinutes) || 15,
    extensions: Array.isArray(item.extensions) ? item.extensions : [],
    packageLabel: item.packageLabel || `${item.packageMinutes} phút`,
    price: Number(item.price) || 0,
    startTime: item.startTime || Date.now(),
    endTime: item.endTime ?? null,
    status: item.status || 'Đang chạy',
    isTest: Boolean(item.isTest),
    updatedAt: Date.now(),
  };

  await setDoc(getHistoryDocRef(cleanItem.id), cleanItem, { merge: true });
}

function hydrateVehicles(rawList) {
  return rawList.map((v) => ({
    id: v.id,
    name: v.name,
    status: v.status || 'idle',
    todayCount: Number(v.todayCount) || 0,
    packageMinutes: v.packageMinutes ?? null,
    totalMinutes: Number(v.totalMinutes) || 0,
    extensions: Array.isArray(v.extensions) ? v.extensions : [],
    price: Number(v.price) || 0,
    startTime: v.startTime ?? null,
    endTime: v.endTime ?? null,
    currentHistoryId: v.currentHistoryId ?? null,
    isTestRun: Boolean(v.isTestRun),
  }));
}

function hydrateHistoryDoc(docSnap) {
  const d = docSnap.data();
  return {
    id: d.id || docSnap.id,
    dateStr: d.dateStr || timestampToVNDateStr(d.startTime),
    vehicleId: d.vehicleId,
    vehicleName: d.vehicleName,
    packageMinutes: Number(d.packageMinutes) || 15,
    totalMinutes: Number(d.totalMinutes) || Number(d.packageMinutes) || 15,
    extensions: Array.isArray(d.extensions) ? d.extensions : [],
    packageLabel: d.packageLabel || `${d.packageMinutes || 15} phút`,
    price: Number(d.price) || 0,
    startTime: Number(d.startTime) || 0,
    endTime: d.endTime ?? null,
    status: d.status || 'Hoàn thành',
    isTest: Boolean(d.isTest),
  };
}

/**
 * Nạp dữ liệu ban đầu từ Firebase ebike-c0a0b và bật đồng bộ 2 chiều real-time
 */
export async function initFirebaseStore() {
  try {
    const [stateSnap, historySnap] = await Promise.all([
      getDoc(getStateDocRef()),
      getDocs(getHistoryColRef()),
    ]);

    if (stateSnap.exists()) {
      const data = stateSnap.data();
      if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
        store.vehicles = hydrateVehicles(data.vehicles);
      }
      if (data.settings) {
        store.settings = {
          soundEnabled: data.settings.soundEnabled ?? true,
          voiceEnabled: data.settings.voiceEnabled ?? true,
          testMode: data.settings.testMode ?? false,
        };
      }
      store.dateStr = data.dateStr || getVNDateParts().displayDate;
      store.dailyResetAt = data.dailyResetAt ?? null;
    } else {
      await saveMainStateToFirebase();
    }

    const loadedHistory = [];
    historySnap.forEach((docSnap) => loadedHistory.push(hydrateHistoryDoc(docSnap)));
    loadedHistory.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
    store.history = loadedHistory;

    await ensureCurrentDay(true);
    store.ready = true;
    console.log(`✅ Đã kết nối Firebase Firestore (ebike-c0a0b): ${store.vehicles.length} xe, ${store.history.length} bản ghi lịch sử.`);

    // Lắng nghe thay đổi từ các thiết bị khác (kể cả app cũ) để đồng bộ ngược lại
    onSnapshot(getStateDocRef(), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
        store.vehicles = hydrateVehicles(data.vehicles);
      }
      if (data.settings) {
        store.settings = {
          soundEnabled: data.settings.soundEnabled ?? true,
          voiceEnabled: data.settings.voiceEnabled ?? true,
          testMode: data.settings.testMode ?? false,
        };
      }
      store.dateStr = data.dateStr || getVNDateParts().displayDate;
      store.dailyResetAt = data.dailyResetAt ?? null;
      recalculateTodayVehicleCounts();
      notifyStoreListeners();
    });

    onSnapshot(getHistoryColRef(), (querySnap) => {
      const list = [];
      querySnap.forEach((docSnap) => list.push(hydrateHistoryDoc(docSnap)));
      list.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
      store.history = list;
      recalculateTodayVehicleCounts();
      notifyStoreListeners();
    });
  } catch (err) {
    console.error('❌ Lỗi kết nối Firebase Firestore:', err.message);
    console.error('👉 Hãy đảm bảo đã tạo Firestore Database và mở Rules trong database/firestore.rules');
  }
}
