import { Request, Response } from 'express';
import { IngredientModel } from '../models/ingredient.model';

export const IngredientController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await IngredientModel.findMany();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await IngredientModel.findFirst({ where: { id: req.params.id } });
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
      const data = await IngredientModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  },
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await IngredientModel.update({ where: { id: req.params.id }, data: req.body });
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  },
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      await IngredientModel.delete({ where: { id: req.params.id } });
      res.json({ message: 'O\'chirildi' });
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
};
