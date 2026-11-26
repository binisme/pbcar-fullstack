import * as vehicleService from '../services/vehicleService.js';

export async function updateSettings(req, res, next) {
  try {
    const state = await vehicleService.updateSettings(req.body);
    req.io.emit('park:update', state);
    res.json(state);
  } catch (err) {
    next(err);
  }
}
