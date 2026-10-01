import { Router } from 'express';
import { login, me, register, updatePassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema, registerSchema, updatePasswordSchema } from '../validations/rules';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, me);
router.put('/password', authenticate, validateRequest(updatePasswordSchema), updatePassword);

export default router;
