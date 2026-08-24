import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { uploadDocumentSchema } from '../schemas/document.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', DocumentController.getDocuments);
router.post('/upload', validateRequest(uploadDocumentSchema), DocumentController.uploadDocument);

export default router;
