// Feedback moderation controller for QuickFuel
import { Request, Response } from 'express';
import { approveFeedback, rejectFeedback, flagFeedback } from '../services/feedbackModeration.service';
import { ApiResponse } from '../types';

export const approveFeedbackController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await approveFeedback(id);
    res.json({ success: true, message: 'Feedback approved' } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve feedback' } as ApiResponse);
  }
};

export const rejectFeedbackController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await rejectFeedback(id);
    res.json({ success: true, message: 'Feedback rejected' } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject feedback' } as ApiResponse);
  }
};

export const flagFeedbackController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await flagFeedback(id);
    res.json({ success: true, message: 'Feedback flagged' } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to flag feedback' } as ApiResponse);
  }
};
