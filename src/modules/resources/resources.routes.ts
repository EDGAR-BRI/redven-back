import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createResourceSchema, updateResourceSchema, resourceFilterSchema } from './resources.schema';
import * as resourcesController from './resources.controller';

const router = Router();

router.post('/', requireAuth, validate(createResourceSchema), resourcesController.create);
router.get('/', validate(resourceFilterSchema, 'query'), resourcesController.list);
router.get('/:id', resourcesController.getById);
router.put('/:id', requireAuth, validate(updateResourceSchema), resourcesController.update);
router.delete('/:id', requireAuth, resourcesController.remove);

export default router;
