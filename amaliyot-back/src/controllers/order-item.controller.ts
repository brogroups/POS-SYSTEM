// @ts-nocheck
import { Request, Response } from 'express';
import { OrderItemModel } from '../models/order-item.model';
import { OrderModel } from '../models/order.model';

export const OrderItemController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('orderItem');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      let include: any = undefined;
      if ('orderItem' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const data = await OrderItemModel.findMany({ where, include });
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
      if ('orderItem' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('orderItem');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await OrderItemModel.findFirst({
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
      const data = await OrderItemModel.create({ data: req.body });

      if (data && data.order_id) {
        const allItems = await OrderItemModel.findMany({ where: { order_id: data.order_id } });
        const total = allItems.reduce((sum: number, item: any) => sum + Number(item.subtotal || ((item.quantity || 0) * (item.price || 0)) || 0), 0);
        await OrderModel.update({
          where: { id: data.order_id },
          data: { total_amount: total, final_amount: total }
        });
      }

      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await OrderItemModel.update({
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('orderItem');
      
      if (hasIsDeleted) {
        await OrderItemModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await OrderItemModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};
