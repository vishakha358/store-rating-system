import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
};

export const addUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

export const addStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingStore = await prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      res.status(409).json({
        success: false,
        message: 'A store with this email already exists',
      });
      return;
    }

    if (ownerId && ownerId.trim() !== '') {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!owner) {
        res.status(404).json({
          success: false,
          message: 'Selected store owner was not found',
        });
        return;
      }

      if (owner.role !== 'STORE_OWNER') {
        res.status(400).json({
          success: false,
          message: 'Assigned user must have the STORE_OWNER role',
        });
        return;
      }
    }

    const newStore = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId && ownerId.trim() !== '' ? ownerId : null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Store added successfully',
      store: newStore,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create store',
      error: error.message,
    });
  }
};

export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name = '',
      email = '',
      address = '',
      sortBy = 'name',
      order = 'asc',
    } = req.query as {
      name?: string;
      email?: string;
      address?: string;
      sortBy?: string;
      order?: string;
    };

    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (email) {
      where.email = { contains: email };
    }
    if (address) {
      where.address = { contains: address };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Format with average rating & count
    let formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const avgRating =
        totalRatings > 0
          ? Number(
              (
                store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
              ).toFixed(1)
            )
          : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        rating: avgRating,
        totalRatings,
        createdAt: store.createdAt,
      };
    });

    // Sorting
    const sortField = sortBy.toLowerCase();
    const isAsc = order.toLowerCase() === 'asc';

    formattedStores.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

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

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name = '',
      email = '',
      address = '',
      role = '',
      sortBy = 'name',
      order = 'asc',
    } = req.query as {
      name?: string;
      email?: string;
      address?: string;
      role?: string;
      sortBy?: string;
      order?: string;
    };

    const where: any = {};
    if (name) {
      where.name = { contains: name };
    }
    if (email) {
      where.email = { contains: email };
    }
    if (address) {
      where.address = { contains: address };
    }
    if (role && role !== 'ALL') {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    // Process user ratings for Store Owners
    let formattedUsers = users.map((user) => {
      let storeRating: number | null = null;
      let storeName: string | null = null;

      if (user.role === 'STORE_OWNER' && user.stores && user.stores.length > 0) {
        storeName = user.stores[0].name;
        const allRatings = user.stores[0].ratings;
        if (allRatings.length > 0) {
          const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
          storeRating = Number((sum / allRatings.length).toFixed(1));
        } else {
          storeRating = 0;
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        rating: storeRating,
        storeName,
        createdAt: user.createdAt,
      };
    });

    // Sorting
    const sortField = sortBy.toLowerCase();
    const isAsc = order.toLowerCase() === 'asc';

    formattedUsers.sort((a: any, b: any) => {
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
      users: formattedUsers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const getStoreOwnersList = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const storeOwners = await prisma.user.findMany({
      where: { role: 'STORE_OWNER' },
      select: {
        id: true,
        name: true,
        email: true,
        stores: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      owners: storeOwners,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store owners list',
      error: error.message,
    });
  }
};
