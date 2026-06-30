import { Router } from 'express';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.get('/stats', dashboardController.stats);

export default router;
