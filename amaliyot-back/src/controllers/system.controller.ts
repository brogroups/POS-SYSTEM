import { Request, Response } from 'express';
import { BranchModel } from '../models/branch.model';
import { CategoryModel } from '../models/category.model';
import { ProductModel } from '../models/product.model';
import { TableModel } from '../models/table.model';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { PaymentModel } from '../models/payment.model';
import { UserModel } from '../models/user.model';

export const SystemController = {
  clearOrders: async (req: Request, res: Response): Promise<void> => {
     try {
        await PaymentModel.deleteMany({});
        await OrderItemModel.deleteMany({});
        await OrderModel.deleteMany({});
        await TableModel.updateMany({
           where: {},
           data: {
              status: 'AVAILABLE',
              is_frozen: false,
              frozen_at: null,
              frozen_by: null,
              frozen_reason: null
           }
        });
        res.json({ success: true, message: "Barcha buyurtmalar va to'lovlar tozalandi, stollar bo'shatildi!" });
     } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
     }
  },
  seedDemoData: async (req: Request, res: Response): Promise<void> => {
     try {
        // Clean existing tables, products, categories, orders, order items, payments, users, branches
        await PaymentModel.deleteMany({});
        await OrderItemModel.deleteMany({});
        await OrderModel.deleteMany({});
        await TableModel.deleteMany({});
        await ProductModel.deleteMany({});
        await CategoryModel.deleteMany({});
        await UserModel.deleteMany({});
        await BranchModel.deleteMany({});
        
        // Fetch or create default branch
        let branch = await BranchModel.findUnique({ where: { id: "000000000000000000000001" } });
        if (!branch) {
           branch = await BranchModel.create({
              data: { id: "000000000000000000000001", name: "Markaziy Filial", address: "Toshkent sh., Chilonzor 1-kvartal" }
           });
        }

        // Create default Super Admin user so they can log in
        await UserModel.create({
           data: {
              branch_id: branch.id,
              first_name: "Super",
              last_name: "Admin",
              phone: "+998901234567",
              password: "111111", // Superadmin pin code matches the login pin
              role: "SUPERADMIN"
           }
        });

        res.json({ success: true, message: "Baza tozalandi va default Super Admin yaratildi!" });
     } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
     }
  }
};
