import * as reportService from '../services/reportService.js';

export function getReport(req, res, next) {
  try {
    const { scope = 'today', date, month } = req.query;
    res.json(reportService.getRevenueReport({ scope, date, month }));
  } catch (err) {
    next(err);
  }
}

export function getHistory(req, res, next) {
  try {
    const { scope = 'today', date, month, includeTest } = req.query;
    res.json(
      reportService.getHistoryList({
        scope,
        date,
        month,
        includeTest: includeTest === 'true',
      })
    );
  } catch (err) {
    next(err);
  }
}
