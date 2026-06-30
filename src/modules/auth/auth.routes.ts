import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from './auth.schema';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/otp/verify', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', requireAuth, authController.getMe);
router.put('/me', requireAuth, validate(updateProfileSchema), authController.updateMe);

export default router;
