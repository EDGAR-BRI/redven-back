import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createSosSchema, updateSosSchema, sosFilterSchema } from './sos.schema';
import * as sosController from './sos.controller';

const router = Router();

router.post('/', requireAuth, validate(createSosSchema), sosController.create);
router.get('/', validate(sosFilterSchema, 'query'), sosController.list);
router.get('/:id', sosController.getById);
router.put('/:id', requireAuth, validate(updateSosSchema), sosController.update);
router.delete('/:id', requireAuth, sosController.remove);

export default router;
