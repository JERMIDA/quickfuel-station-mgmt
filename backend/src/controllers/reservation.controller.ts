import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as reservationService from '../services/reservation.service';

export const createReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { station_id, fuel_type_id, amount, time_slot } = req.body;
    const reservation = await reservationService.createReservation({
      user_id: userId,
      station_id,
      fuel_type_id,
      amount,
      time_slot,
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const reservations = await reservationService.getUserReservations(userId);
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const getStationReservations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { stationId } = req.params;
    if (Array.isArray(stationId)) stationId = stationId[0];
    const reservations = await reservationService.getStationReservations(stationId);
    res.json({ success: true, data: reservations });
  } catch (error) {
    next(error);
  }
};

export const approveReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const reservation = await reservationService.updateReservationStatus(id, 'approved');
    
    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

export const rejectReservation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const reservation = await reservationService.updateReservationStatus(id, 'rejected');
    
    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    res.json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};
