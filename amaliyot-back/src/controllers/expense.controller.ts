// @ts-nocheck
import { Request, Response } from 'express';
import { ExpenseModel } from '../models/expense.model';
import { ExpenseService } from '../services/expense.service';

export const ExpenseController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const where: any = { is_deleted: false };
      
      // Optional filters
      if (req.query.status) where.status = req.query.status;
      if (req.query.category) where.category = req.query.category;
      if (req.query.branch_id) where.branch_id = req.query.branch_id;

      const data = await ExpenseModel.findMany({ where });
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: String(error) });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await ExpenseModel.findFirst({
        where: { id, is_deleted: false }
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
      const userId = req.user?.id || req.body.user_id;
      const data = await ExpenseService.createExpense(req.body, userId);
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await ExpenseModel.update({
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
      await ExpenseModel.update({
        where: { id },
        data: { is_deleted: true }
      });
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  // ========== Service-backed endpoints ==========

  approve: async (req: Request, res: Response): Promise<void> => {
    try {
      const expenseId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const result = await ExpenseService.approveExpense(expenseId, userId);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  reject: async (req: Request, res: Response): Promise<void> => {
    try {
      const expenseId = req.params.id;
      const userId = req.user?.id || req.body.user_id;
      const { reason } = req.body;
      const result = await ExpenseService.rejectExpense(expenseId, userId, reason);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};
