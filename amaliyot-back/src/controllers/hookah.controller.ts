// @ts-nocheck
import { Request, Response } from 'express';
import { HookahModel } from '../models/hookah.model';
import { HookahService } from '../services/hookah.service';

export const HookahController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const where: any = { is_deleted: false };
      if (req.query.branch_id) where.branch_id = req.query.branch_id;
      if (req.query.category) where.category = req.query.category;

      const data = await HookahModel.findMany({ where });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await HookahService.getWithRecipe(id);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await HookahModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await HookahModel.update({
        where: { id },
        data: req.body
      });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      await HookahModel.update({
        where: { id },
        data: { is_deleted: true }
      });
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  getDailyReport: async (req: Request, res: Response): Promise<void> => {
    try {
      const branchId = req.query.branch_id as string || '000000000000000000000001';
      const date = req.query.date as string;
      const report = await HookahService.getDailyReport(branchId, date);
      res.json(report);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  linkToProduct: async (req: Request, res: Response): Promise<void> => {
    try {
      const hookahId = req.params.id;
      const { product_id } = req.body;
      const userId = req.user?.id || req.body.user_id;

      if (!product_id) {
        res.status(400).json({ error: 'product_id majburiy' });
        return;
      }

      const result = await HookahService.linkToProduct(hookahId, product_id, userId);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};
