import { Router } from 'express';
import { CostController } from '../controllers/cost.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { logCostSchema } from '../schemas/cost.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', CostController.getCosts);
router.post('/', validateRequest(logCostSchema), CostController.logCost);

export default router;
