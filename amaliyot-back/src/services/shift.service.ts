import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { TableModel } from '../models/table.model';
import { ShiftSessionModel } from '../models/shift-session.model';
import { IngredientModel } from '../models/ingredient.model';
import { PrinterModel } from '../models/printer.model';
import { ExpenseModel } from '../models/expense.model';
import { PaymentModel } from '../models/payment.model';
import { CashService } from './cash.service';
import { logAuditAction } from '../config/audit-logger';

export const ShiftService = {
  async validateClose(shiftSessionId: string): Promise<{
    can_close: boolean;
    issues: Array<{ type: string; message: string; severity: 'ERROR' | 'WARNING' }>;
  }> {
    const issues: Array<{ type: string; message: string; severity: 'ERROR' | 'WARNING' }> = [];

    const shift = await ShiftSessionModel.findFirst({ where: { id: shiftSessionId } });
    if (!shift) {
      return { can_close: false, issues: [{ type: 'NOT_FOUND', message: 'Smena topilmadi', severity: 'ERROR' }] };
    }

    const branchId = shift.branch_id;

    // 1. Check active tables
    const activeTables = await TableModel.findMany({
      where: {
        branch_id: branchId,
        status: { $in: ['OCCUPIED', 'FROZEN'] },
        is_deleted: false
      }
    });

    if (activeTables.length > 0) {
      const frozenCount = activeTables.filter((t: any) => t.is_frozen).length;
      const occupiedCount = activeTables.length - frozenCount;
      let msg = '';
      if (occupiedCount > 0) msg += `${occupiedCount} ta band stol`;
      if (frozenCount > 0) msg += `${msg ? ', ' : ''}${frozenCount} ta muzlatilgan stol`;
      issues.push({
        type: 'ACTIVE_TABLES',
        message: `${msg} mavjud.`,
        severity: 'ERROR'
      });
    }

    // 2. Check unpaid sessions (ACTIVE sessions)
    const activeOrders = await OrderModel.findMany({
      where: {
        branch_id: branchId,
        session_status: 'ACTIVE',
        is_deleted: false
      }
    });

    if (activeOrders.length > 0) {
      issues.push({
        type: 'ACTIVE_SESSIONS',
        message: `${activeOrders.length} ta to'lanmagan buyurtma sessiyalari mavjud.`,
        severity: 'ERROR'
      });
    }

    // 3. Check pending kitchen items
    if (activeOrders.length > 0) {
      const orderIds = activeOrders.map((o: any) => o.id);
      const pendingKitchenItems = await OrderItemModel.findMany({
        where: {
          order_id: { $in: orderIds },
          kitchen_status: { $in: ['PENDING', 'PREPARING'] }
        }
      });

      if (pendingKitchenItems.length > 0) {
        issues.push({
          type: 'PENDING_KITCHEN',
          message: `Oshxonada tayyorlanayotgan ${pendingKitchenItems.length} ta taom mavjud.`,
          severity: 'ERROR'
        });
      }
    }

    // 4. Check inventory inconsistencies (negative quantities)
    const negativeIngredients = await IngredientModel.findMany({
      where: {
        branch_id: branchId,
        quantity: { $lt: 0 }
      }
    });

    if (negativeIngredients.length > 0) {
      issues.push({
        type: 'INVENTORY_INCONSISTENCY',
        message: `${negativeIngredients.length} ta masalliqda zaxira miqdori manfiy bo'lib ketgan.`,
        severity: 'ERROR'
      });
    }

    // 5. Check printer failures (configured printers that are not active)
    const inactivePrinters = await PrinterModel.findMany({
      where: {
        branch_id: branchId,
        is_active: false
      }
    });

    if (inactivePrinters.length > 0) {
      issues.push({
        type: 'PRINTER_FAILURE',
        message: `Faol bo'lmagan printer(lar) aniqlandi: ${inactivePrinters.map((p: any) => p.name).join(', ')}.`,
        severity: 'WARNING'
      });
    }

    // 6. Check pending expense approvals
    const pendingExpenses = await ExpenseModel.findMany({
      where: {
        branch_id: branchId,
        status: 'PENDING',
        is_deleted: false
      }
    });

    if (pendingExpenses.length > 0) {
      issues.push({
        type: 'PENDING_EXPENSES',
        message: `${pendingExpenses.length} ta tasdiqlanmagan xarajat mavjud.`,
        severity: 'WARNING'
      });
    }

    const canClose = !issues.some((issue) => issue.severity === 'ERROR');

    return {
      can_close: canClose,
      issues
    };
  },

  async closeShift(shiftSessionId: string, closingBalance: number): Promise<any> {
    const validation = await this.validateClose(shiftSessionId);
    if (!validation.can_close) {
      throw new Error('Smenani yopib bo\'lmaydi: Faol stollar, sessiyalar yoki ombor xatoliklari mavjud');
    }

    const shift = await ShiftSessionModel.findFirst({ where: { id: shiftSessionId } });
    if (!shift) throw new Error('Smena topilmadi');

    // Log closing cash movement
    await CashService.logMovement(
      shiftSessionId,
      shift.cashier_id?.toString(),
      'CLOSING_CASH',
      closingBalance,
      'Smena yopilishi',
      shiftSessionId,
      'SHIFT'
    );

    const updatedShift = await ShiftSessionModel.update({
      where: { id: shiftSessionId },
      data: {
        closing_balance: closingBalance,
        status: 'CLOSED',
        closed_at: new Date()
      }
    });

    await logAuditAction(shift.cashier_id?.toString(), 'SHIFT_CLOSED', 'ShiftSession', shiftSessionId, null, updatedShift);
    return updatedShift;
  },

  /**
   * Generate comprehensive Z-Report for a shift
   */
  async generateShiftReport(shiftSessionId: string): Promise<any> {
    const shift = await ShiftSessionModel.findFirst({ where: { id: shiftSessionId } });
    if (!shift) throw new Error('Smena topilmadi');

    const branchId = shift.branch_id?.toString();
    const openedAt = shift.opened_at || shift.created_at;
    const closedAt = shift.closed_at || new Date();

    // Get cash summary
    const cashSummary = await CashService.getCashSummary(shiftSessionId);

    // Get all orders completed during this shift period
    const completedOrders = await OrderModel.findMany({
      where: {
        branch_id: branchId,
        session_status: 'PAID',
        closed_at: { $gte: openedAt, $lte: closedAt },
        is_deleted: false
      }
    });

    // Payment breakdown
    const payments: any[] = [];
    for (const order of completedOrders) {
      const orderPayments = await PaymentModel.findMany({ where: { order_id: order.id } });
      payments.push(...orderPayments);
    }

    const paymentByMethod: Record<string, { count: number; total: number }> = {};
    for (const p of payments) {
      const method = p.payment_method || 'UNKNOWN';
      if (!paymentByMethod[method]) paymentByMethod[method] = { count: 0, total: 0 };
      paymentByMethod[method].count++;
      paymentByMethod[method].total += p.amount || 0;
    }

    // Expenses during shift
    const expenses = await ExpenseModel.findMany({
      where: {
        branch_id: branchId,
        status: 'APPROVED',
        expense_date: { $gte: openedAt, $lte: closedAt },
        is_deleted: false
      }
    });
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    const expensesByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const cat = exp.category || 'MISC';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (exp.amount || 0);
    }

    // Cash reconciliation
    const expectedCash = cashSummary.current_balance;
    const actualCash = shift.closing_balance || 0;
    const difference = actualCash - expectedCash;

    return {
      shift_id: shiftSessionId,
      branch_id: branchId,
      cashier_id: shift.cashier_id,
      opened_at: openedAt,
      closed_at: closedAt,
      opening_balance: shift.opening_balance || 0,
      closing_balance: shift.closing_balance || 0,

      // Sales
      total_orders: completedOrders.length,
      total_sales: completedOrders.reduce((sum: number, o: any) => sum + (o.final_amount || 0), 0),
      payment_by_method: paymentByMethod,

      // Expenses
      total_expenses: totalExpenses,
      expenses_by_category: expensesByCategory,
      expense_count: expenses.length,

      // Cash
      cash_summary: cashSummary,
      expected_cash: expectedCash,
      actual_cash: actualCash,
      cash_difference: difference,

      // Status
      is_balanced: Math.abs(difference) < 1 // Allow 1 unit tolerance
    };
  }
};
