import { Router } from 'express';
import { createBooking, getMyBookings, getGarageBookings, cancelBooking, updateBookingStatus } from '../controllers/booking.controller';
import { authenticate, isProfessional } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my/upcoming', authenticate, getMyBookings);
router.get('/my/past', authenticate, getMyBookings);
router.get('/garage', authenticate, isProfessional, getGarageBookings);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.patch('/:id/status', authenticate, isProfessional, updateBookingStatus);

export default router;
