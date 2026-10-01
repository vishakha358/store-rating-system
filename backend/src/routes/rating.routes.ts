import { Router } from 'express';
import { submitOrUpdateRating } from '../controllers/rating.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { submitRatingSchema } from '../validations/rules';

const router = Router();

// Normal users can submit or modify ratings for a store
router.post(
  '/stores/:storeId',
  authenticate,
  requireRoles('USER'),
  validateRequest(submitRatingSchema),
  submitOrUpdateRating
);

export default router;
