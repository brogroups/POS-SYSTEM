// @ts-nocheck
import { Request, Response } from 'express';
import { TableModel } from '../models/table.model';
import { TableTimelineModel } from '../models/table-timeline.model';
import { OrderService } from '../services/order.service';

export const RestaurantTableController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('restaurantTable');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      const data = await TableModel.findMany({ where });
      
      const formatted = data.map((t: any, index: number) => {
        const num = (t.table_number !== undefined && t.table_number !== null && String(t.table_number).trim() !== '')
          ? t.table_number
          : (index + 1);
        return {
          ...t,
          table_number: num
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      
      let include: any = undefined;
      if ('restaurantTable' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('restaurantTable');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await TableModel.findFirst({
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
      let branchId = req.body.branch_id;
      if (!branchId || branchId === 1 || branchId === '1') {
        branchId = '000000000000000000000001';
      }
      const data = await TableModel.create({ data: { ...req.body, branch_id: branchId } });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const updateData = { ...req.body };
      if (updateData.branch_id === 1 || updateData.branch_id === '1') {
        updateData.branch_id = '000000000000000000000001';
      }
      const data = await TableModel.update({
        where: { id },
        data: updateData
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('restaurantTable');
      
      if (hasIsDeleted) {
        await TableModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await TableModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  // ========== Service-backed endpoints ==========

  freezeTable: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const reason = req.body.reason || '';
      const result = await OrderService.freezeTable(tableId, userId, reason);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  unfreezeTable: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const result = await OrderService.unfreezeTable(tableId, userId);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  closeTable: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const result = await OrderService.closeTable(tableId, userId);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  getTimeline: async (req: Request, res: Response): Promise<void> => {
    try {
      const tableId = req.params.id;
      const timeline = await TableTimelineModel.findMany({
        where: { table_id: tableId }
      });
      res.json(timeline);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  }
};
