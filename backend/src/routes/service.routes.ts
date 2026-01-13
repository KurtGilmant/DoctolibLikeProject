import { Router } from 'express';
import { createService, updateService, deleteService } from '../controllers/service.controller';
import { authenticate, isProfessional } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, isProfessional, createService);
router.put('/:id', authenticate, isProfessional, updateService);
router.delete('/:id', authenticate, isProfessional, deleteService);

export default router;
