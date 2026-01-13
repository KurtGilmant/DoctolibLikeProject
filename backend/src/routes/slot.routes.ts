import { Router } from 'express';
import { getSlots, createSlot, deleteSlot } from '../controllers/slot.controller';
import { authenticate, isProfessional } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getSlots);
router.post('/', authenticate, isProfessional, createSlot);
router.delete('/:id', authenticate, isProfessional, deleteSlot);

export default router;
