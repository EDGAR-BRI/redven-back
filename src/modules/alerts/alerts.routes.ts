import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createAlertSchema, updateAlertSchema, alertFilterSchema } from './alerts.schema';
import * as alertsController from './alerts.controller';

const router = Router();

router.post('/', requireAuth, validate(createAlertSchema), alertsController.create);
router.get('/', validate(alertFilterSchema, 'query'), alertsController.list);
router.get('/:id', alertsController.getById);
router.put('/:id', requireAuth, validate(updateAlertSchema), alertsController.update);
router.delete('/:id', requireAuth, alertsController.remove);

export default router;
