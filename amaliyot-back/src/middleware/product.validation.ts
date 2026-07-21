import { Request, Response, NextFunction } from 'express';

export const validateProduct = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'POST') {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: 'Request body is empty' });
      return;
    }
  }
  next();
};
