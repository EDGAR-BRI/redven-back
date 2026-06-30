import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReportSchema, updateReportSchema, reportFilterSchema } from './reports.schema';
import * as reportsController from './reports.controller';

const router = Router();

router.post('/', requireAuth, validate(createReportSchema), reportsController.create);
router.get('/', validate(reportFilterSchema, 'query'), reportsController.list);
router.get('/:id', reportsController.getById);
router.put('/:id', requireAuth, validate(updateReportSchema), reportsController.update);
router.delete('/:id', requireAuth, reportsController.remove);

export default router;
