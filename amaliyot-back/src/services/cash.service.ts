import { CashMovementModel } from '../models/cash-movement.model';
import { ShiftSessionModel } from '../models/shift-session.model';
import { ExpenseModel } from '../models/expense.model';
import { emitToAll } from '../config/socket';

export const CashService = {
  async getActiveShift(branchId: string): Promise<any> {
    return ShiftSessionModel.findFirst({
      where: {
        branch_id: branchId,
        status: 'OPEN'
      }
    });
  },

  async logMovement(
    shiftSessionId: string,
    userId: string,
    type: 'OPENING_CASH' | 'CLOSING_CASH' | 'MANUAL_DEPOSIT' | 'MANUAL_WITHDRAWAL' | 'ORDER_PAYMENT' | 'EXPENSE_PAYMENT' | 'SUPPLIER_PAYMENT' | 'REFUND' | 'ADJUSTMENT',
    amount: number,
    description: string = '',
    referenceId?: string,
    referenceType?: 'ORDER' | 'EXPENSE' | 'PURCHASE' | 'MANUAL' | 'SHIFT'
  ): Promise<any> {
    // Determine branch_id from the shift
    let branchId: string | undefined;
    try {
      const shift = await ShiftSessionModel.findFirst({ where: { id: shiftSessionId } });
      if (shift) branchId = shift.branch_id?.toString();
    } catch {}

    const movement = await CashMovementModel.create({
      data: {
        shift_session_id: shiftSessionId,
        branch_id: branchId,
        user_id: userId,
        type,
        amount,
        description,
        reference_id: referenceId || undefined,
        reference_type: referenceType || 'MANUAL'
      }
    });

    emitToAll('cash:movement', { shift_session_id: shiftSessionId, movement });
    emitToAll('cash:summary_updated', { shift_session_id: shiftSessionId });
    return movement;
  },

  async handleOrderPayment(shiftSessionId: string, userId: string, amount: number, orderId: string, method: string): Promise<void> {
    // Only CASH payments affect cash drawer directly, but let's record it
    if (method.toUpperCase() === 'CASH') {
      await this.logMovement(
        shiftSessionId, userId, 'ORDER_PAYMENT', amount,
        `Buyurtma #${orderId} to'lovi`,
        orderId, 'ORDER'
      );
    }

    // Update total sales in Shift Session
    const shift = await ShiftSessionModel.findFirst({ where: { id: shiftSessionId } });
    if (shift) {
      const newSales = (shift.total_sales || 0) + amount;
      await ShiftSessionModel.update({
        where: { id: shiftSessionId },
        data: { total_sales: newSales }
      });
    }
  },

  async handleExpenseApproval(expenseId: string, userId: string): Promise<any> {
    const expense = await ExpenseModel.findFirst({ where: { id: expenseId } });
    if (!expense) throw new Error('Xarajat topilmadi');

    if (expense.status === 'APPROVED') return expense;

    // Approve the expense
    const updatedExpense = await ExpenseModel.update({
      where: { id: expenseId },
      data: { status: 'APPROVED' }
    });

    // Find active shift to deduct expense from cash drawer
    const activeShift = await this.getActiveShift(expense.branch_id.toString());
    if (activeShift) {
      await this.logMovement(
        activeShift.id,
        userId,
        'EXPENSE_PAYMENT',
        -expense.amount,
        `Tasdiqlangan xarajat: ${expense.title}`,
        expenseId,
        'EXPENSE'
      );
    }

    emitToAll('expense:approved', { expense: updatedExpense });
    return updatedExpense;
  },

  /**
   * Get cash summary for a shift session
   * Returns opening balance, total deposits, withdrawals, sales, expenses, and current balance
   */
  async getCashSummary(shiftSessionId: string): Promise<any> {
    const shift = await ShiftSessionModel.findFirst({ where: { id: shiftSessionId } });
    if (!shift) throw new Error('Smena topilmadi');

    const movements = await CashMovementModel.findMany({
      where: { shift_session_id: shiftSessionId }
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalSales = 0;
    let totalExpenses = 0;
    let totalRefunds = 0;
    let totalSupplierPayments = 0;

    for (const m of movements) {
      const amt = m.amount || 0;
      switch (m.type) {
        case 'OPENING_CASH':
          break; // opening balance is separate
        case 'MANUAL_DEPOSIT':
          totalDeposits += amt;
          break;
        case 'MANUAL_WITHDRAWAL':
          totalWithdrawals += Math.abs(amt);
          break;
        case 'ORDER_PAYMENT':
          totalSales += amt;
          break;
        case 'EXPENSE_PAYMENT':
          totalExpenses += Math.abs(amt);
          break;
        case 'SUPPLIER_PAYMENT':
          totalSupplierPayments += Math.abs(amt);
          break;
        case 'REFUND':
          totalRefunds += Math.abs(amt);
          break;
        case 'ADJUSTMENT':
          if (amt > 0) totalDeposits += amt;
          else totalWithdrawals += Math.abs(amt);
          break;
      }
    }

    const openingBalance = shift.opening_balance || 0;
    const currentBalance = openingBalance + totalSales + totalDeposits - totalWithdrawals - totalExpenses - totalSupplierPayments - totalRefunds;

    return {
      shift_session_id: shiftSessionId,
      opening_balance: openingBalance,
      total_sales: totalSales,
      total_deposits: totalDeposits,
      total_withdrawals: totalWithdrawals,
      total_expenses: totalExpenses,
      total_supplier_payments: totalSupplierPayments,
      total_refunds: totalRefunds,
      current_balance: currentBalance,
      movement_count: movements.length
    };
  },

  /**
   * Get detailed movement history for a shift
   */
  async getMovementsByShift(shiftSessionId: string): Promise<any> {
    return CashMovementModel.findMany({
      where: { shift_session_id: shiftSessionId }
    });
  }
};
