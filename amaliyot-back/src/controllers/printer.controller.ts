// @ts-nocheck
import { Request, Response } from 'express';
import { PrinterModel } from '../models/printer.model';
import os from 'os';
import net from 'net';

export const PrinterController = {
  scanLan: async (req: Request, res: Response): Promise<void> => {
    try {
      const interfaces = os.networkInterfaces();
      const subnets: string[] = [];

      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
          if (!iface.internal && iface.family === 'IPv4') {
            const parts = iface.address.split('.');
            if (parts.length === 4) {
              subnets.push(`${parts[0]}.${parts[1]}.${parts[2]}`);
            }
          }
        }
      }

      const uniqueSubnets = Array.from(new Set(subnets));
      if (uniqueSubnets.length === 0) {
        uniqueSubnets.push('192.168.1', '192.168.0', '192.168.8');
      }

      const pingPort = (ip: string, port = 9100, timeout = 350): Promise<boolean> => {
        return new Promise((resolve) => {
          const socket = new net.Socket();
          socket.setTimeout(timeout);
          socket.on('connect', () => {
            socket.destroy();
            resolve(true);
          });
          socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
          });
          socket.on('error', () => {
            socket.destroy();
            resolve(false);
          });
          socket.connect(port, ip);
        });
      };

      const foundPrinters: Array<{ ip: string; port: number; status: string }> = [];

      for (const subnet of uniqueSubnets) {
        const ips = Array.from({ length: 254 }, (_, i) => `${subnet}.${i + 1}`);
        const batchSize = 35;

        for (let i = 0; i < ips.length; i += batchSize) {
          const batch = ips.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (ip) => {
              const isOpen = await pingPort(ip, 9100, 350);
              return isOpen ? { ip, port: 9100, status: 'Online' } : null;
            })
          );
          for (const item of results) {
            if (item) foundPrinters.push(item);
          }
        }
      }

      res.json({
        success: true,
        count: foundPrinters.length,
        printers: foundPrinters
      });
    } catch (error) {
      console.error('LAN Printer scan error:', error);
      res.status(500).json({ error: String(error) });
    }
  },

  testLanPrinter: async (req: Request, res: Response): Promise<void> => {
    try {
      const { ip, port = 9100 } = req.body;
      if (!ip) {
        res.status(400).json({ error: 'IP manzil kiritilmadi' });
        return;
      }

      const socket = new net.Socket();
      socket.setTimeout(2500);

      socket.on('connect', () => {
        // Send ESC/POS test command: Initialize, Center align, Bold, Text, Cut paper
        const testBuffer = Buffer.from(
          '\x1b\x40' + // Init
          '\x1b\x61\x01' + // Center
          '\x1b\x45\x01' + // Bold ON
          'OHLALA POS - LAN TEST\n' +
          '\x1b\x45\x00' + // Bold OFF
          'IP: ' + ip + '\n' +
          'Ethernet ulanishi muvaffaqiyatli!\n\n\n' +
          '\x1d\x56\x41\x03', // Cut
          'raw'
        );
        socket.write(testBuffer, () => {
          socket.destroy();
          res.json({ success: true, message: `LAN Printer (${ip}:${port}) muvaffaqiyatli ulandi va sinov cheki chop etildi!` });
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        res.status(408).json({ error: `Printer javob bermadi (${ip}:${port}). IP manzil va printer yoqilganini tekshiring.` });
      });

      socket.on('error', (err: any) => {
        socket.destroy();
        res.status(500).json({ error: `Ulanishda xatolik: ${err.message || 'Printer bilan bog\'lanib bo\'lmadi'}` });
      });

      socket.connect(port, ip);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  },

  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('printer');
      const where = hasIsDeleted ? { is_deleted: false } : {};
      
      let include: any = undefined;
      if ('printer' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const data = await PrinterModel.findMany({ where, include });
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
      if ('printer' === 'order') {
        include = {
          order_items: {
            include: {
              product: true
            }
          }
        };
      }
      
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('printer');
      const where = { id, ...(hasIsDeleted ? { is_deleted: false } : {}) };
      
      const data = await PrinterModel.findFirst({
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
      const data = await PrinterModel.create({ data: req.body });
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const data = await PrinterModel.update({
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
      const hasIsDeleted = ['user', 'category', 'product', 'customer', 'restaurantTable', 'discount'].includes('printer');
      
      if (hasIsDeleted) {
        await PrinterModel.update({
          where: { id },
          data: { is_deleted: true }
        });
      } else {
        await PrinterModel.delete({ where: { id } });
      }
      res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: String(error) });
    }
  }
};

