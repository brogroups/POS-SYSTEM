import { IngredientModel } from '../models/ingredient.model';
import { PurchaseModel } from '../models/purchase.model';
import { StockMovementModel } from '../models/stock-movement.model';
import { CashService } from './cash.service';
import { InventoryService } from './inventory.service';
import { logAuditAction } from '../config/audit-logger';
import { emitToAll } from '../config/socket';

export const PurchaseService = {
  /**
   * Create a purchase and automatically increase inventory
   */
  async createPurchase(purchaseData: {
    supplier_name: string;
    invoice_number: string;
    total_cost: number;
    payment_status: 'PAID' | 'PENDING';
    branch_id: string;
    items: Array<{
      ingredient_id: string;
      quantity: number;
      unit: string;
      price_per_unit: number;
    }>;
  }, userId: string): Promise<any> {
    // Create Purchase Record
    const purchase = await PurchaseModel.create({
      data: {
        supplier_name: purchaseData.supplier_name,
        invoice_number: purchaseData.invoice_number,
        total_cost: purchaseData.total_cost,
        payment_status: purchaseData.payment_status,
        received_by: userId,
        branch_id: purchaseData.branch_id,
        purchase_date: new Date(),
        items: purchaseData.items
      }
    });

    // Update Ingredients Quantity
    for (const item of purchaseData.items) {
      const ingredient = await IngredientModel.findFirst({ where: { id: item.ingredient_id } });
      if (!ingredient) continue;

      const baseQtyAdded = InventoryService.convertToBaseUnit(item.quantity, item.unit);
      const newQty = ingredient.quantity + baseQtyAdded;

      await IngredientModel.update({
        where: { id: item.ingredient_id },
        data: { quantity: newQty }
      });

      // Log Stock Movement
      await StockMovementModel.create({
        data: {
          branch_id: purchaseData.branch_id,
          ingredient_id: item.ingredient_id,
          user_id: userId,
          type: 'IN',
          quantity: baseQtyAdded,
          note: `Xarid (Invoice #${purchaseData.invoice_number})`
        }
      });
    }

    // If purchase is paid, log cash movement for supplier payment
    if (purchaseData.payment_status === 'PAID') {
      const activeShift = await CashService.getActiveShift(purchaseData.branch_id);
      if (activeShift) {
        await CashService.logMovement(
          activeShift.id,
          userId,
          'SUPPLIER_PAYMENT',
          -purchaseData.total_cost,
          `Yetkazib beruvchi to'lovi: ${purchaseData.supplier_name} (Invoice #${purchaseData.invoice_number})`
        );
      }
    }

    await logAuditAction(userId, 'PURCHASE_CREATED', 'Purchase', purchase.id, null, purchase);
    emitToAll('inventory:updated', { branch_id: purchaseData.branch_id });
    return purchase;
  },

  /**
   * Mark a pending purchase as paid
   */
  async markAsPaid(purchaseId: string, userId: string): Promise<any> {
    const purchase = await PurchaseModel.findFirst({ where: { id: purchaseId } });
    if (!purchase) throw new Error('Xarid topilmadi');

    if (purchase.payment_status === 'PAID') {
      throw new Error('Bu xarid allaqachon to\'langan');
    }

    const updated = await PurchaseModel.update({
      where: { id: purchaseId },
      data: { payment_status: 'PAID' }
    });

    // Log cash movement
    const activeShift = await CashService.getActiveShift(purchase.branch_id.toString());
    if (activeShift) {
      await CashService.logMovement(
        activeShift.id,
        userId,
        'SUPPLIER_PAYMENT',
        -purchase.total_cost,
        `Yetkazib beruvchi to'lovi: ${purchase.supplier_name} (Invoice #${purchase.invoice_number})`
      );
    }

    await logAuditAction(userId, 'PURCHASE_PAID', 'Purchase', purchaseId, purchase, updated);
    return updated;
  }
};
