import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createVolunteerSchema, updateVolunteerSchema, volunteerFilterSchema } from './volunteers.schema';
import * as volunteersController from './volunteers.controller';

const router = Router();

router.post('/', requireAuth, validate(createVolunteerSchema), volunteersController.create);
router.get('/', validate(volunteerFilterSchema, 'query'), volunteersController.list);
router.get('/:id', volunteersController.getById);
router.put('/:id', requireAuth, validate(updateVolunteerSchema), volunteersController.update);
router.delete('/:id', requireAuth, volunteersController.remove);

export default router;
