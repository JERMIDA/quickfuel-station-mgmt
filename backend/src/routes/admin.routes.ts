import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireOperator } from '../middleware/role.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Admin: Dashboard stats
router.get('/stats', authenticate, requireAdmin, adminController.getDashboardStats);

// Admin: Get all users
router.get('/users', authenticate, requireAdmin, adminController.getAllUsers);

// Admin: Update user role
router.patch('/users/:id/role', authenticate, requireAdmin, adminController.updateUserRole);

// Operator: Get my station
router.get('/my-station', authenticate, requireOperator, adminController.getOperatorStation);

export default router;
