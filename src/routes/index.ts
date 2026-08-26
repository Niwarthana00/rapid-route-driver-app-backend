import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import dashboardRoutes from './dashboard.routes';
import tripRoutes from './trip.routes';
import locationRoutes from './location.routes';
import breakdownRoutes from './breakdown.routes';
import documentRoutes from './document.routes';
import costRoutes from './cost.routes';

import { TripController } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Base route: /api/v1/driver
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/trips', tripRoutes);
router.get('/routes/:routeId/halts', authMiddleware, TripController.getActiveHalts);
router.use('/location', locationRoutes);
router.use('/breakdowns', breakdownRoutes);
router.use('/documents', documentRoutes);
router.use('/costs', costRoutes);

export default router;
