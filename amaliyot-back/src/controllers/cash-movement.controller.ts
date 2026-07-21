import { Request, Response } from 'express';
import { CashMovementModel } from '../models/cash-movement.model';
import { CashService } from '../services/cash.service';

export const CashMovementController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await CashMovementModel.findMany();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },
  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await CashMovementModel.findFirst({ where: { id: req.params.id } });
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
      const { shift_session_id, user_id, type, amount, description } = req.body;
      const data = await CashService.logMovement(shift_session_id, user_id, type, amount, description);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: String(error) });
    }
  }
};
