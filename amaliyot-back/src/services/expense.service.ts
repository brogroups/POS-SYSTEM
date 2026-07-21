import { ExpenseModel } from '../models/expense.model';
import { UserModel } from '../models/user.model';
import { CashService } from './cash.service';
import { logAuditAction } from '../config/audit-logger';
import { emitToAll } from '../config/socket';

export const ExpenseService = {
  /**
   * Create an expense. Auto-approves for MANAGER and above.
   */
  async createExpense(data: {
    branch_id: string;
    title: string;
    description?: string;
    category: string;
    amount: number;
    expense_date?: Date;
  }, userId: string): Promise<any> {
    const user = await UserModel.findFirst({ where: { id: userId } });
    if (!user) throw new Error('Foydalanuvchi topilmadi');

    const isAutoApprove = ['MANAGER', 'SUPERADMIN', 'ADMIN'].includes(user.role);

    const expense = await ExpenseModel.create({
      data: {
        branch_id: data.branch_id,
        user_id: userId,
        title: data.title,
        description: data.description || '',
        category: data.category,
        amount: data.amount,
        expense_date: data.expense_date || new Date(),
        status: isAutoApprove ? 'APPROVED' : 'PENDING',
        approved_by: isAutoApprove ? userId : undefined
      }
    });

    // If auto-approved, deduct from cash drawer
    if (isAutoApprove) {
      const activeShift = await CashService.getActiveShift(data.branch_id);
      if (activeShift) {
        await CashService.logMovement(
          activeShift.id,
          userId,
          'EXPENSE_PAYMENT',
          -data.amount,
          `Xarajat: ${data.title}`
        );
      }
    }

    await logAuditAction(userId, 'EXPENSE_CREATED', 'Expense', expense.id, null, expense);
    emitToAll('expense:created', { expense });
    return expense;
  },

  /**
   * Approve an expense (Manager+ only)
   */
  async approveExpense(expenseId: string, userId: string): Promise<any> {
    const user = await UserModel.findFirst({ where: { id: userId } });
    if (!user) throw new Error('Foydalanuvchi topilmadi');

    if (!['MANAGER', 'SUPERADMIN', 'ADMIN'].includes(user.role)) {
      throw new Error('Ruxsat berilmadi: Faqat Manager yoki undan yuqori lavozim tasdiqlashi mumkin');
    }

    const expense = await ExpenseModel.findFirst({ where: { id: expenseId } });
    if (!expense) throw new Error('Xarajat topilmadi');

    if (expense.status === 'APPROVED') {
      throw new Error('Bu xarajat allaqachon tasdiqlangan');
    }

    const updated = await ExpenseModel.update({
      where: { id: expenseId },
      data: {
        status: 'APPROVED',
        approved_by: userId
      }
    });

    // Deduct from cash drawer
    const activeShift = await CashService.getActiveShift(expense.branch_id.toString());
    if (activeShift) {
      await CashService.logMovement(
        activeShift.id,
        userId,
        'EXPENSE_PAYMENT',
        -expense.amount,
        `Tasdiqlangan xarajat: ${expense.title}`
      );
    }

    await logAuditAction(userId, 'EXPENSE_APPROVED', 'Expense', expenseId, expense, updated);
    emitToAll('expense:approved', { expense: updated });
    return updated;
  },

  /**
   * Reject an expense (Manager+ only)
   */
  async rejectExpense(expenseId: string, userId: string, reason: string = ''): Promise<any> {
    const user = await UserModel.findFirst({ where: { id: userId } });
    if (!user) throw new Error('Foydalanuvchi topilmadi');

    if (!['MANAGER', 'SUPERADMIN', 'ADMIN'].includes(user.role)) {
      throw new Error('Ruxsat berilmadi: Faqat Manager yoki undan yuqori lavozim rad etishi mumkin');
    }

    const expense = await ExpenseModel.findFirst({ where: { id: expenseId } });
    if (!expense) throw new Error('Xarajat topilmadi');

    if (expense.status !== 'PENDING') {
      throw new Error('Faqat kutilayotgan xarajatlarni rad etish mumkin');
    }

    const updated = await ExpenseModel.update({
      where: { id: expenseId },
      data: {
        status: 'REJECTED',
        rejected_reason: reason
      }
    });

    await logAuditAction(userId, 'EXPENSE_REJECTED', 'Expense', expenseId, expense, updated);
    emitToAll('expense:rejected', { expense: updated });
    return updated;
  }
};
