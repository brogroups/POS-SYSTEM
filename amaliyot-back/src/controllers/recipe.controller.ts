import { Request, Response } from 'express';
import { RecipeModel } from '../models/recipe.model';

export const RecipeController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await RecipeModel.findMany();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await RecipeModel.findFirst({ where: { id: req.params.id } });
      if (!data) {
        res.status(404).json({ error: 'Topilmadi' });
        return;
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },
  getByProductId: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await RecipeModel.findFirst({ where: { product_id: req.params.productId } });
      if (!data) {
        res.status(404).json({ error: 'Topilmadi' });
        return;
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { product_id, ingredients } = req.body;
      const existing = await RecipeModel.findFirst({ where: { product_id } });
      if (existing) {
        const updated = await RecipeModel.update({
          where: { id: existing.id },
          data: { ingredients }
        });
        res.json(updated);
        return;
      }
      const data = await RecipeModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  },
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await RecipeModel.update({ where: { id: req.params.id }, data: req.body });
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  },
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      await RecipeModel.delete({ where: { id: req.params.id } });
      res.json({ message: 'O\'chirildi' });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
};
