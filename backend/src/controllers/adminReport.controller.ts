// Admin report controller for QuickFuel
import { Request, Response } from 'express';
import { AdminReportService } from '../services/adminReport.service';
import { ApiResponse } from '../types';

export class AdminReportController {
  static async getSummary(req: Request, res: Response) {
    try {
      const summary = await AdminReportService.getSummary();
      res.json({ success: true, data: summary } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch summary' } as ApiResponse);
    }
  }

  static async getPopularStations(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await AdminReportService.getPopularStations(limit);
      res.json({ success: true, data } as ApiResponse);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch popular stations' } as ApiResponse);
    }
  }
}
