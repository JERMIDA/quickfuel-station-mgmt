import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as adminService from '../services/admin.service';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const { role } = req.body;
    const user = await adminService.updateUserRole(id, role);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getOperatorStation = async (
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

    const station = await adminService.getStationByOperatorId(operatorId);
    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found' });
      return;
    }

    res.json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};
