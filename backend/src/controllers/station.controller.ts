import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as stationService from '../services/station.service';

export const getAllStations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stations = await stationService.getVerifiedStations();
    res.json({ success: true, data: stations });
  } catch (error) {
    next(error);
  }
};

export const getStationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const station = await stationService.getStationWithDetails(id);
    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }
    res.json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

export const createStation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const operatorId = req.user?.id;
    if (!operatorId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, latitude, longitude } = req.body;
    const station = await stationService.createStation({
      name,
      latitude,
      longitude,
      operator_id: operatorId,
    });

    res.status(201).json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

export const verifyStation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const station = await stationService.verifyStation(id);
    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }
    res.json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};
