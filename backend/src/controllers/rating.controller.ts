import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const submitOrUpdateRating = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { storeId } = req.params;
    const { rating } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      res.status(404).json({ success: false, message: 'Store not found' });
      return;
    }

    // Upsert rating for (userId, storeId)
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    // Calculate new overall rating
    const allStoreRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const totalRatings = allStoreRatings.length;
    const overallRating =
      totalRatings > 0
        ? Number(
            (
              allStoreRatings.reduce((sum, r) => sum + r.rating, 0) /
              totalRatings
            ).toFixed(1)
          )
        : 0;

    res.json({
      success: true,
      message: 'Rating saved successfully',
      rating: savedRating,
      storeStats: {
        overallRating,
        totalRatings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message,
    });
  }
};
