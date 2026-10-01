import { Router } from 'express';
import { getStoreOwnerDashboard, getStoresForUser } from '../controllers/store.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';

const router = Router();

// Route for normal user to view registered stores
router.get('/user', authenticate, requireRoles('USER'), getStoresForUser);

// Route for store owner to view their store dashboard
router.get('/owner/dashboard', authenticate, requireRoles('STORE_OWNER'), getStoreOwnerDashboard);

export default router;
