import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  startTripSchema,
  updateHaltSchema,
  completeHaltSchema,
  finishTripSchema,
} from '../schemas/trip.schema';

const router = Router();

router.use(authMiddleware);

router.get('/active/halts', TripController.getActiveHalts);
router.patch('/halts/:haltId', validateRequest(updateHaltSchema), TripController.updateHalt);
router.post('/start', validateRequest(startTripSchema), TripController.startTrip);
router.post('/halts/complete', validateRequest(completeHaltSchema), TripController.completeHalt);
router.post('/finish', validateRequest(finishTripSchema), TripController.finishTrip);

export default router;
