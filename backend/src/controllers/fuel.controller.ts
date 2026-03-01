import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as fuelService from '../services/fuel.service';

export const getFuelTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fuelTypes = await fuelService.getFuelTypes();
    res.json({ success: true, data: fuelTypes });
  } catch (error) {
    next(error);
  }
};

export const getStationFuel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
      let { stationId } = req.params;
      if (Array.isArray(stationId)) stationId = stationId[0];
    const fuel = await fuelService.getStationFuel(stationId);
    res.json({ success: true, data: fuel });
  } catch (error) {
    next(error);
  }
};
