import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getStoresForUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { search = '', sortBy = 'name', order = 'asc' } = req.query as {
      search?: string;
      sortBy?: string;
      order?: string;
    };

    const where: any = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
    });

    let formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const overallRating =
        totalRatings > 0
          ? Number(
              (
                store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
              ).toFixed(1)
            )
          : 0;

      // Find current user's submitted rating if any
      const userRatingObj = currentUserId
        ? store.ratings.find((r) => r.userId === currentUserId)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userRating: userRatingObj ? userRatingObj.rating : null,
        userRatingId: userRatingObj ? userRatingObj.id : null,
      };
    });

    const sortField = sortBy.toLowerCase();
    const isAsc = order.toLowerCase() === 'asc';

    formattedStores.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) return isAsc ? 1 : -1;
      if (valB === null || valB === undefined) return isAsc ? -1 : 1;

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }

      return 0;
    });

    res.json({
      success: true,
      stores: formattedStores,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message,
    });
  }
};

export const getStoreOwnerDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId) {
      res.status(401).json({ success: false, message: 'Unauthenticated' });
      return;
    }

    // Find the store(s) owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!store) {
      res.status(404).json({
        success: false,
        message: 'No store found associated with this store owner account. Please contact an administrator.',
      });
      return;
    }

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? Number(
            (
              store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
            ).toFixed(1)
          )
        : 0;

    // Rating breakdown for chart / stats (e.g. 5 stars: X, 4 stars: Y...)
    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    store.ratings.forEach((r) => {
      ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
    });

    const ratersList = store.ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    res.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      stats: {
        totalRatings,
        averageRating,
        ratingBreakdown,
      },
      ratings: ratersList,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store owner dashboard',
      error: error.message,
    });
  }
};
