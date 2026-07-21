// @ts-nocheck
import { Request, Response } from 'express';
import { ShiftSessionModel } from '../models/shift-session.model';
import { ShiftService } from '../services/shift.service';
import { CashService } from '../services/cash.service';

export const ShiftSessionController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('shiftSession');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      let include: any = undefined;
      if ('shiftSession' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const data = await ShiftSessionModel.findMany({ where, include });
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
      if ('shiftSession' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('shiftSession');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await ShiftSessionModel.findFirst({
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
      const data = await ShiftSessionModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await ShiftSessionModel.update({
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('shiftSession');
      
      if (hasIsDeleted) {
        await ShiftSessionModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await ShiftSessionModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  validateClose: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await ShiftService.validateClose(id);
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  closeShift: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const { closing_balance } = req.body;
      const data = await ShiftService.closeShift(id, Number(closing_balance || 0));
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  generateReport: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const report = await ShiftService.generateShiftReport(id);
      res.json(report);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getCashSummary: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const summary = await CashService.getCashSummary(id);
      res.json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getCashMovements: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const movements = await CashService.getMovementsByShift(id);
      res.json(movements);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  }
};
