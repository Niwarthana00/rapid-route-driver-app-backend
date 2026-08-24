import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { pingLocationSchema } from '../schemas/trip.schema';

const router = Router();

router.use(authMiddleware);

router.post('/ping', validateRequest(pingLocationSchema), TripController.pingLocation);

export default router;
