import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';

export const createProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { full_name, phone, role } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const profile = await authService.createProfile(userId, full_name, phone, role);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
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

    const profile = await authService.getProfileByUserId(userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
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

    const { full_name, phone } = req.body;
    const profile = await authService.updateProfile(userId, { full_name, phone });
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let { id } = req.params;
    if (Array.isArray(id)) id = id[0];
    const profile = await authService.getProfileByUserId(id);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
