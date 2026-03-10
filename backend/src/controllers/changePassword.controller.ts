// Change password controller for QuickFuel
import { Request, Response } from 'express';
import { changePassword } from '../services/changePassword.service';
import { ApiResponse } from '../types';
import type { AuthRequest } from '../middleware/auth.middleware';

export const changePasswordController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing required fields' } as ApiResponse);
  }
  try {
    const result = await changePassword(userId, currentPassword, newPassword);
    if (result.success) {
      return res.json({ success: true, message: 'Password changed successfully' } as ApiResponse);
    }
    return res.status(400).json({ success: false, message: result.message } as ApiResponse);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to change password' } as ApiResponse);
  }
};
