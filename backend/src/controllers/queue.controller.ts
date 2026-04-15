import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as queueService from '../services/queue.service';

export const updateQueue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { stationId } = req.params;
    if (Array.isArray(stationId)) stationId = stationId[0];
    const { queue_length } = req.body;
    const queue = await queueService.updateQueueLength(stationId, queue_length);
    if (!queue) {
      res.status(404).json({ success: false, message: 'Queue not found' });
      return;
    }
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

export const getQueueByStation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { stationId } = req.params;
    if (Array.isArray(stationId)) stationId = stationId[0];
    const queue = await queueService.getQueueByStationId(stationId);
    if (!queue) {
      res.status(404).json({ success: false, message: 'Queue not found' });
      return;
    }
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};
