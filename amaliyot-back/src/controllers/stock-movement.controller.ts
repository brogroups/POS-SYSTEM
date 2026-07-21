// @ts-nocheck
import { Request, Response } from 'express';
import { StockMovementModel } from '../models/stock-movement.model';

export const StockMovementController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('stockMovement');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      let include: any = undefined;
      if ('stockMovement' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const data = await StockMovementModel.findMany({ where, include });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      
      let include: any = undefined;
      if ('stockMovement' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('stockMovement');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await StockMovementModel.findFirst({
        where,
        include
      });
      
      if (!data) {
        res.status(404).json({ error: 'Topilmadi' });
        return;
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await StockMovementModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await StockMovementModel.update({
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('stockMovement');
      
      if (hasIsDeleted) {
        await StockMovementModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await StockMovementModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};
