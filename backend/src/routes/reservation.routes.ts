import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireDriver, requireOperator } from '../middleware/role.middleware';
import * as reservationController from '../controllers/reservation.controller';

const router = Router();

// Driver: Create reservation
router.post('/', authenticate, requireDriver, reservationController.createReservation);

// Driver: Get my reservations
router.get('/my', authenticate, requireDriver, reservationController.getMyReservations);

// Operator: Get station reservations
router.get('/station/:stationId', authenticate, requireOperator, reservationController.getStationReservations);

// Operator: Approve reservation
router.patch('/:id/approve', authenticate, requireOperator, reservationController.approveReservation);

// Operator: Reject reservation
router.patch('/:id/reject', authenticate, requireOperator, reservationController.rejectReservation);

export default router;
