import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createChatMessageSchema, chatFilterSchema } from './chat.schema';
import * as chatController from './chat.controller';

const router = Router();

router.post('/', requireAuth, validate(createChatMessageSchema), chatController.create);
router.get('/', validate(chatFilterSchema, 'query'), chatController.list);
router.put('/:id/status', requireAuth, chatController.updateStatus);
router.get('/stats/:sector', chatController.sectorStats);

export default router;
