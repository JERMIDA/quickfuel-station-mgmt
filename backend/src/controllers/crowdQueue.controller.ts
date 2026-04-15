// Crowdsourced queue verification controller for QuickFuel
import { Request, Response } from 'express';
import { submitCrowdQueue, getCrowdQueueReports, verifyCrowdQueue } from '../services/crowdQueue.service';
import { ApiResponse } from '../types';
import type { AuthRequest } from '../middleware/auth.middleware';

export const submitCrowdQueueController = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { station_id, queue_length } = req.body;
  if (!userId || !station_id || typeof queue_length !== 'number') {
    return res.status(400).json({ success: false, message: 'Missing required fields' } as ApiResponse);
  }
  try {
    await submitCrowdQueue({ user_id: userId, station_id, queue_length });
    res.json({ success: true, message: 'Queue report submitted' } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit queue report' } as ApiResponse);
  }
};

export const getCrowdQueueReportsController = async (req: Request, res: Response) => {
  const { station_id } = req.query;
  try {
    const reports = await getCrowdQueueReports(station_id as string);
    res.json({ success: true, data: reports } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' } as ApiResponse);
  }
};

export const verifyCrowdQueueController = async (req: AuthRequest, res: Response) => {
  const { station_id } = req.body;
  try {
    await verifyCrowdQueue(station_id);
    res.json({ success: true, message: 'Queue verified and updated' } as ApiResponse);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify queue' } as ApiResponse);
  }
};
