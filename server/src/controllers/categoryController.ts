import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../config/prisma';

export class CategoryController {
  static async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const categories = await prisma.category.findMany({
        where: {
          OR: [{ isDefault: true }, { userId }],
        },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch categories.' });
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, icon = 'Tag', color = '#6366f1' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required.' });
      }

      const existing = await prisma.category.findFirst({
        where: {
          name: { equals: name.trim() },
          OR: [{ isDefault: true }, { userId }],
        },
      });

      if (existing) {
        return res.status(409).json({ error: `A category named "${name.trim()}" already exists.` });
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          icon: icon.trim(),
          color: color.trim(),
          isDefault: false,
          userId,
        },
      });

      res.status(201).json(category);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create category.' });
    }
  }
}
