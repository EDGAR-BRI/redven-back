import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createPersonSchema, updatePersonSchema, personFilterSchema } from './persons.schema';
import * as personsController from './persons.controller';

const router = Router();

router.post('/', requireAuth, validate(createPersonSchema), personsController.create);
router.get('/', validate(personFilterSchema, 'query'), personsController.list);
router.get('/:id', personsController.getById);
router.put('/:id', requireAuth, validate(updatePersonSchema), personsController.update);
router.delete('/:id', requireAuth, personsController.remove);

export default router;
