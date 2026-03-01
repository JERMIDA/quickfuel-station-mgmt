import { type Request, type Response, type NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import * as feedbackService from '../services/feedback.service';

export const createFeedback = async (
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

    const { station_id, rating, comment } = req.body;
    const feedback = await feedbackService.createFeedback({
      user_id: userId,
      station_id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackByStation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
      let { stationId } = req.params;
      if (Array.isArray(stationId)) stationId = stationId[0];
    const feedback = await feedbackService.getApprovedFeedbackByStation(stationId);
    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};
