import { Router } from 'express';
import { BreakdownController } from '../controllers/breakdown.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createBreakdownSchema } from '../schemas/breakdown.schema';

const router = Router();

router.use(authMiddleware);

router.post('/', validateRequest(createBreakdownSchema), BreakdownController.reportBreakdown);

export default router;
