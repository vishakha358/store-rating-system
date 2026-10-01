import { Router } from 'express';
import {
  addStore,
  addUser,
  getDashboardStats,
  getStoreOwnersList,
  getStores,
  getUsers,
} from '../controllers/admin.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { adminCreateStoreSchema, adminCreateUserSchema } from '../validations/rules';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRoles('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.post('/users', validateRequest(adminCreateUserSchema), addUser);
router.get('/users', getUsers);
router.get('/store-owners', getStoreOwnersList);
router.post('/stores', validateRequest(adminCreateStoreSchema), addStore);
router.get('/stores', getStores);

export default router;
