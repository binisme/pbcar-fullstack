import { getStore } from './parkStore.js';
import {
  getVNDateParts,
  timestampToVNDateStr,
  dateKeyToVNDateStr,
  vnDateStrToDateKey,
  vnDateStrToMonthKey,
  formatMonthKeyToVN,
} from '../utils/dateHelper.js';

function getRealStatsForItem(item) {
  if (!item || item.isTest) {
    return { realTurns: 0, realRevenue: 0, pkg15Count: 0, pkg15Rev: 0, pkg30Count: 0, pkg30Rev: 0 };
  }

  let realTurns = 1;
  let pkg15Count = 0;
  let pkg15Rev = 0;
  let pkg30Count = 0;
  let pkg30Rev = 0;

  if (item.packageMinutes === 15) {
    pkg15Count += 1;
    pkg15Rev += 50000;
  } else {
    pkg30Count += 1;
    pkg30Rev += 80000;
  }

  const exts = Array.isArray(item.extensions) ? item.extensions : [];
  for (const ext of exts) {
    if (ext && ext.isTest) continue;
    realTurns += 1;
    if (ext.minutes === 15) {
      pkg15Count += 1;
      pkg15Rev += Number(ext.price) || 50000;
    } else {
      pkg30Count += 1;
      pkg30Rev += Number(ext.price) || 80000;
    }
  }

  return {
    realTurns,
    realRevenue: pkg15Rev + pkg30Rev,
    pkg15Count,
    pkg15Rev,
    pkg30Count,
    pkg30Rev,
  };
}

export function getRevenueReport({ scope = 'today', date, month }) {
  const store = getStore();
  const today = getVNDateParts();
  const targetDateKey = scope === 'day' && date ? date : today.dateKey;
  const targetDateStr = dateKeyToVNDateStr(targetDateKey);
  const targetMonthKey = scope === 'month' && month ? month : today.monthKey;

  const realAll = store.history.filter((h) => h && !h.isTest);
  let filtered = [];
  let label = `Hôm nay (${today.displayDate})`;

  if (scope === 'today') {
    filtered = realAll.filter((h) => (h.dateStr || timestampToVNDateStr(h.startTime)) === today.displayDate);
  } else if (scope === 'day') {
    label = `Ngày ${targetDateStr}`;
    filtered = realAll.filter((h) => (h.dateStr || timestampToVNDateStr(h.startTime)) === targetDateStr);
  } else {
    label = formatMonthKeyToVN(targetMonthKey);
    filtered = realAll.filter((h) => {
      const dStr = h.dateStr || timestampToVNDateStr(h.startTime);
      return vnDateStrToMonthKey(dStr) === targetMonthKey;
    });
  }

  let pkg15Count = 0;
  let pkg15Revenue = 0;
  let pkg30Count = 0;
  let pkg30Revenue = 0;
  let totalTurns = 0;

  const vehicleMap = new Map(
    store.vehicles.map((v) => [v.name, { vehicleName: v.name, turns: 0, revenue: 0 }])
  );
  const dayMap = new Map();

  for (const item of filtered) {
    const stats = getRealStatsForItem(item);
    pkg15Count += stats.pkg15Count;
    pkg15Revenue += stats.pkg15Rev;
    pkg30Count += stats.pkg30Count;
    pkg30Revenue += stats.pkg30Rev;
    totalTurns += stats.realTurns;

    if (!vehicleMap.has(item.vehicleName)) {
      vehicleMap.set(item.vehicleName, { vehicleName: item.vehicleName, turns: 0, revenue: 0 });
    }
    const vStat = vehicleMap.get(item.vehicleName);
    vStat.turns += stats.realTurns;
    vStat.revenue += stats.realRevenue;

    if (scope === 'month') {
      const dStr = item.dateStr || timestampToVNDateStr(item.startTime);
      const dKey = vnDateStrToDateKey(dStr);
      if (!dayMap.has(dKey)) {
        dayMap.set(dKey, {
          dateKey: dKey,
          displayDate: dStr,
          turns: 0,
          revenue: 0,
          pkg15: 0,
          pkg30: 0,
        });
      }
      const dStat = dayMap.get(dKey);
      dStat.turns += stats.realTurns;
      dStat.revenue += stats.realRevenue;
      dStat.pkg15 += stats.pkg15Count;
      dStat.pkg30 += stats.pkg30Count;
    }
  }

  return {
    scope,
    dateKey: targetDateKey,
    monthKey: targetMonthKey,
    label,
    totalRevenue: pkg15Revenue + pkg30Revenue,
    totalTurns,
    pkg15Count,
    pkg15Revenue,
    pkg30Count,
    pkg30Revenue,
    byVehicle: Array.from(vehicleMap.values()),
    byDay: Array.from(dayMap.values()).sort((a, b) => b.dateKey.localeCompare(a.dateKey)),
  };
}

export function getHistoryList({ scope = 'today', date, month, includeTest = false }) {
  const store = getStore();
  const today = getVNDateParts();
  const targetDateKey = scope === 'day' && date ? date : today.dateKey;
  const targetDateStr = dateKeyToVNDateStr(targetDateKey);
  const targetMonthKey = scope === 'month' && month ? month : today.monthKey;

  let filtered = store.history;
  if (scope === 'today') {
    filtered = store.history.filter((h) => (h.dateStr || timestampToVNDateStr(h.startTime)) === today.displayDate);
  } else if (scope === 'day') {
    filtered = store.history.filter((h) => (h.dateStr || timestampToVNDateStr(h.startTime)) === targetDateStr);
  } else {
    filtered = store.history.filter((h) => {
      const dStr = h.dateStr || timestampToVNDateStr(h.startTime);
      return vnDateStrToMonthKey(dStr) === targetMonthKey;
    });
  }

  let totalRealTurns = 0;
  const items = [];

  for (const h of filtered) {
    const stats = getRealStatsForItem(h);
    totalRealTurns += stats.realTurns;
    if (!includeTest && h.isTest) continue;

    const exts = Array.isArray(h.extensions) ? h.extensions : [];
    const displayDate = h.dateStr || timestampToVNDateStr(h.startTime);

    items.push({
      id: h.id,
      vehicleId: h.vehicleId,
      vehicleName: h.vehicleName,
      dateKey: vnDateStrToDateKey(displayDate),
      displayDate,
      packageMinutes: h.packageMinutes,
      totalMinutes: h.totalMinutes || h.packageMinutes,
      packageLabel: h.packageLabel || `${h.packageMinutes} phút`,
      initialPrice: h.isTest ? 0 : (h.packageMinutes === 15 ? 50000 : 80000),
      totalPrice: stats.realRevenue,
      realTurns: stats.realTurns,
      startTime: h.startTime,
      endTime: h.endTime,
      status: h.status || 'Hoàn thành',
      isTest: Boolean(h.isTest),
      extensions: exts.map((ext, idx) => ({
        id: idx + 1,
        minutes: ext.minutes,
        price: Number(ext.price) || 0,
        extendedAt: ext.time || h.startTime,
        isTest: Boolean(ext.isTest),
      })),
    });
  }

  return { scope, totalRealTurns, items };
}
