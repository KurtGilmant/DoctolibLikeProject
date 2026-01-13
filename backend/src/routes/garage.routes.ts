import { Router } from 'express';
import { getGarages, getGarageById, createGarage, updateGarage, getMyGarage, getGarageStats } from '../controllers/garage.controller';
import { authenticate, isProfessional } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getGarages);
router.get('/my', authenticate, isProfessional, getMyGarage);
router.get('/stats', authenticate, isProfessional, getGarageStats);
router.get('/:id', getGarageById);
router.post('/', authenticate, isProfessional, createGarage);
router.put('/:id', authenticate, isProfessional, updateGarage);

export default router;
