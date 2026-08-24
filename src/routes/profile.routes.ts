import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', ProfileController.getProfile);
router.put('/', validateRequest(updateProfileSchema), ProfileController.updateProfile);

export default router;
