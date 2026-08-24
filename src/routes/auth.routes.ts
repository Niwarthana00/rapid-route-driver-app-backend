import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/register', validateRequest(registerSchema), AuthController.register);

export default router;
