import * as vehicleService from '../services/vehicleService.js';

export function getState(req, res, next) {
  try {
    res.json(vehicleService.getPublicState());
  } catch (err) {
    next(err);
  }
}

export async function start(req, res, next) {
  try {
    const state = await vehicleService.startVehicle(Number(req.params.id), req.body.minutes);
    req.io.emit('park:update', state);
    res.json(state);
  } catch (err) {
    next(err);
  }
}

export async function extend(req, res, next) {
  try {
    const state = await vehicleService.extendVehicle(Number(req.params.id), req.body.minutes);
    req.io.emit('park:update', state);
    res.json(state);
  } catch (err) {
    next(err);
  }
}

export async function stop(req, res, next) {
  try {
    const state = await vehicleService.finishVehicle(Number(req.params.id), 'stop');
    req.io.emit('park:update', state);
    res.json(state);
  } catch (err) {
    next(err);
  }
}

export async function confirm(req, res, next) {
  try {
    const state = await vehicleService.finishVehicle(Number(req.params.id), 'confirm');
    req.io.emit('park:update', state);
    res.json(state);
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(req, res, next) {
  try {
    const result = await vehicleService.addVehicle();
    req.io.emit('park:update', result.state);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicle(req, res, next) {
  try {
    const result = await vehicleService.removeVehicle(Number(req.params.id));
    req.io.emit('park:update', result.state);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetToday(req, res, next) {
  try {
    const state = await vehicleService.resetTodayCardCounters();
    req.io.emit('park:update', state);
    res.json(state);
  } catch (err) {
    next(err);
  }
}
