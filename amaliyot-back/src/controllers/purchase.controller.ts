import { Request, Response } from 'express';
import { PurchaseModel } from '../models/purchase.model';
import { PurchaseService } from '../services/purchase.service';

export const PurchaseController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const where: any = {};
      if (req.query.branch_id) where.branch_id = req.query.branch_id;
      if (req.query.payment_status) where.payment_status = req.query.payment_status;

      const data = await PurchaseModel.findMany({ where });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await PurchaseModel.findFirst({ where: { id: req.params.id } });
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
      const userId = (req as any).user?.id || req.body.user_id;
      const data = await PurchaseService.createPurchase(req.body, userId);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  },

  markAsPaid: async (req: Request, res: Response): Promise<void> => {
    try {
      const purchaseId = req.params.id as string;
      const userId = (req as any).user?.id || req.body.user_id;
      const data = await PurchaseService.markAsPaid(purchaseId, userId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
};
