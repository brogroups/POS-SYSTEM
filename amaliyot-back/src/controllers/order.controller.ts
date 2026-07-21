// @ts-nocheck
import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { OrderService } from '../services/order.service';
import { OrderItemHistoryModel } from '../models/order-item-history.model';

export const OrderController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('order');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      let include: any = undefined;
      if ('order' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const data = await OrderModel.findMany({ where, include });
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
      if ('order' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('order');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await OrderModel.findFirst({
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
      const data = await OrderModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await OrderModel.update({
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('order');
      
      if (hasIsDeleted) {
        await OrderModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await OrderModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  // ========== Service-backed endpoints ==========

  openSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { table_id, session_name, source, order_type } = req.body;
      const userId = req.user?.id || req.body.user_id;
      const branchId = req.body.branch_id || req.user?.branch_id || '000000000000000000000001';

      if (!table_id) {
        res.status(400).json({ error: 'table_id majburiy' });
        return;
      }

      const order = await OrderService.openSession(
        table_id, userId, branchId, session_name, source, order_type
      );
      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  editItems: async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const userRole = req.user?.role || req.body.user_role || 'SUPERADMIN';
      const userName = req.user?.first_name || req.body.user_name || 'Ofitsiant';
      const { items, device } = req.body;

      if (!items || !Array.isArray(items)) {
        res.status(400).json({ error: 'items massivi majburiy' });
        return;
      }

      const result = await OrderService.editOrderItems(orderId, userId, items, device, userRole, userName);
      res.json(result);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || String(error);
      res.status(403).json({ error: msg });
    }
  },

  payAndClose: async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const { amount_paid, payment_method, discount_id, discount_amount } = req.body;

      const result = await OrderService.payAndCloseSession(
        orderId, userId, amount_paid, payment_method, discount_id, discount_amount
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  getTableSessions: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.tableId;
      const sessions = await OrderService.getTableSessions(tableId);
      res.json(sessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getSessionDetails: async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const details = await OrderService.getSessionDetails(orderId);
      res.json(details);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  swapItem: async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const { old_product_id, new_product_id, reason, device } = req.body;

      if (!old_product_id || !new_product_id) {
        res.status(400).json({ error: 'old_product_id va new_product_id majburiy' });
        return;
      }

      const result = await OrderService.swapOrderItem(
        orderId, old_product_id, new_product_id, userId, reason, device
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  getItemHistory: async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const where: any = { order_id: orderId };

      // Support optional query filters
      if (req.query.change_type) where.change_type = req.query.change_type;
      if (req.query.user_id) where.user_id = req.query.user_id;

      const history = await OrderItemHistoryModel.findMany({ where });
      res.json(history);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  moveItems: async (req: Request, res: Response): Promise<void> => {
    try {
      const fromOrderId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const { to_order_id, product_id, quantity, reason, device } = req.body;

      if (!to_order_id || !product_id || !quantity) {
        res.status(400).json({ error: 'to_order_id, product_id va quantity majburiy' });
        return;
      }

      const result = await OrderService.moveItemBetweenSessions(
        fromOrderId, to_order_id, product_id, quantity, userId, reason, device
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  getActiveTableSessions: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.tableId;
      const sessions = await OrderService.getActiveTableSessions(tableId);
      res.json(sessions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getTableTimeline: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.tableId;
      const sessionId = req.query.session_id as string | undefined;
      const timeline = await OrderService.getTableTimeline(tableId, sessionId);
      res.json(timeline);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  transferTableOrder: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fromTableId, toTableId, user_id, user_name } = req.body;
      const userId = req.user?.id || user_id || 'system';
      const userName = user_name || 'Xodim';

      const result = await OrderService.transferTableOrder(
        fromTableId, toTableId, userId, userName
      );
      res.json(result);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ error: error.message || String(error) });
    }
  }
};
