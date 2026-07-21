// @ts-nocheck
import { Request, Response } from 'express';
import { PaymentModel } from '../models/payment.model';

export const PaymentController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('payment');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      let include: any = undefined;
      if ('payment' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const data = await PaymentModel.findMany({ where, include });
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
      if ('payment' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('payment');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await PaymentModel.findFirst({
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
      const data = await PaymentModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await PaymentModel.update({
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('payment');
      
      if (hasIsDeleted) {
        await PaymentModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await PaymentModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};
