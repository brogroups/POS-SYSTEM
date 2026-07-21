import mongoose from 'mongoose';
import { OrderModel } from '../models/order.model';
import { OrderItemModel } from '../models/order-item.model';
import { TableModel } from '../models/table.model';
import { OrderItemHistoryModel } from '../models/order-item-history.model';
import { TableTimelineModel } from '../models/table-timeline.model';
import { UserModel } from '../models/user.model';
import { ProductModel } from '../models/product.model';
import { PaymentModel } from '../models/payment.model';
import { InventoryService } from './inventory.service';
import { CashService } from './cash.service';
import { emitToAll } from '../config/socket';
import { logAuditAction } from '../config/audit-logger';

// Helper: get active (non-closed) sessions for a table
async function getActiveSessionsForTable(tableId: string) {
  return OrderModel.findMany({
    where: {
      table_id: tableId,
      session_status: 'ACTIVE',
      is_deleted: false
    }
  });
}

export const OrderService = {
  /**
   * Open a new session (order) on a table.
   * Supports multiple simultaneous sessions per table.
   */
  async openSession(
    tableId: string,
    userId: string,
    branchId: string,
    sessionName: string = 'Asosiy',
    source: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' = 'DINE_IN',
    orderType: 'STANDARD' | 'EXPRESS' = 'STANDARD'
  ): Promise<any> {
    // 1. Get current active sessions to determine session number
    const activeSessions = await getActiveSessionsForTable(tableId);
    const sessionNum = activeSessions.length + 1;
    const finalSessionName = sessionName || `Sessiya #${sessionNum}`;

    const cleanBranchId = (branchId && mongoose.Types.ObjectId.isValid(branchId)) ? branchId : '000000000000000000000001';
    const cleanWaiterId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : undefined;

    // 2. Create the Order (session)
    const order = await OrderModel.create({
      data: {
        branch_id: cleanBranchId,
        table_id: tableId,
        waiter_id: cleanWaiterId,
        source,
        order_type: orderType,
        status: 'PENDING',
        session_status: 'ACTIVE',
        total_amount: 0,
        final_amount: 0,
        session_name: finalSessionName,
        session_number: sessionNum
      }
    });

    // 3. Update Table Status to OCCUPIED if it isn't FROZEN
    const table = await TableModel.findFirst({ where: { id: tableId } });
    if (table && table.status !== 'FROZEN') {
      await TableModel.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' }
      });
    }

    // 4. Log Table Timeline
    await TableTimelineModel.create({
      data: {
        table_id: tableId,
        order_id: order.id,
        session_id: order.id,
        user_id: userId,
        action_type: 'SESSION_CREATED',
        details: `Yangi sessiya ochildi: "${finalSessionName}"`,
        metadata: { session_name: finalSessionName, session_number: sessionNum }
      }
    });

    await logAuditAction(userId, 'SESSION_OPENED', 'Order', order.id, null, order);
    emitToAll('table:status_changed', { table_id: tableId });
    emitToAll('order:updated', { order_id: order.id });
    return order;
  },

  /**
   * Edit order items with granular kitchen synchronization.
   * Only quantity deltas are sent to kitchen as PENDING.
   * Each individual change generates its own timeline entry.
   */
  async editOrderItems(
    orderId: string,
    userId: string,
    items: Array<{ product_id: string; quantity: number; price: number; reason?: string }>,
    device: string = 'POS',
    userRole: string = 'SUPERADMIN',
    userName: string = 'Foydalanuvchi'
  ): Promise<any> {
    const order = await OrderModel.findFirst({ where: { id: orderId } });
    if (!order) throw new Error('Order topilmadi');
    if (order.session_status !== 'ACTIVE') throw new Error('Bu sessiya yopilgan, tahrirlash mumkin emas');

    const tableId = order.table_id;
    const branchId = order.branch_id;

    // Get existing order items
    const existingItems = await OrderItemModel.findMany({ where: { order_id: orderId } });

    // Pre-check if WAITER is attempting to reduce quantity / minus an item
    const isWaiter = userRole?.toUpperCase() === 'WAITER';
    if (isWaiter) {
      for (const newItem of items) {
        const existing = existingItems.find(
          (i: any) => i.product_id.toString() === newItem.product_id
        );
        const oldQty = existing ? existing.quantity : 0;
        const newQty = newItem.quantity;

        if (existing && newQty < oldQty) {
          let productName = 'Taom';
          try {
            const product = await ProductModel.findFirst({ where: { id: newItem.product_id } });
            if (product) productName = product.name;
          } catch {}

          let tableNumber: any = '-';
          if (tableId) {
            try {
              const table = await TableModel.findFirst({ where: { id: tableId } });
              if (table) tableNumber = table.table_number;
            } catch {}
          }

          // Emit real-time notification to Cashier/Manager
          emitToAll('cashier:reduction_requested', {
            order_id: orderId,
            table_id: tableId,
            table_number: tableNumber,
            product_name: productName,
            old_qty: oldQty,
            new_qty: newQty,
            waiter_name: userName || 'Ofitsiant',
            reason: newItem.reason || 'Kamaytirish so\'raldi'
          });

          // Log timeline entry
          if (tableId) {
            await TableTimelineModel.create({
              data: {
                table_id: tableId.toString(),
                order_id: orderId,
                session_id: orderId,
                user_id: userId,
                action_type: 'ITEM_QTY_DECREASE_REQUESTED',
                details: `[WAITER MINUS SO'ROVI] Ofitsiant ${userName} ${productName} sonini kamaytirish so'rovini yubordi (${oldQty} → ${newQty})`,
                metadata: { product_name: productName, old_qty: oldQty, new_qty: newQty, waiter_name: userName, reason: newItem.reason }
              }
            });
          }

          throw new Error(`Ofitsiant tayyor buyurtmadagi taomni (${productName}) minus qila olmaydi! Kassirga so'rov yuborildi.`);
        }
      }
    }

    let totalAmount = 0;

    for (const newItem of items) {
      const existing = existingItems.find(
        (i: any) => i.product_id.toString() === newItem.product_id
      );

      // Resolve product name for history
      let productName = '';
      try {
        const product = await ProductModel.findFirst({ where: { id: newItem.product_id } });
        if (product) productName = product.name;
      } catch {}

      const oldQty = existing ? existing.quantity : 0;
      const newQty = newItem.quantity;
      const changeQty = newQty - oldQty;

      if (changeQty === 0) {
        totalAmount += newItem.quantity * newItem.price;
        continue;
      }

      if (existing) {
        if (newQty > 0) {
          // Quantity increased or decreased but still in order
          await OrderItemModel.update({
            where: { id: existing.id },
            data: {
              quantity: newQty,
              subtotal: newQty * newItem.price,
              // If quantity increased, reset kitchen status to PENDING for delta processing
              kitchen_status: changeQty > 0 ? 'PENDING' : existing.kitchen_status
            }
          });

          await OrderItemHistoryModel.create({
            data: {
              order_id: orderId,
              branch_id: branchId,
              user_id: userId,
              product_id: newItem.product_id,
              product_name: productName,
              change_type: 'QTY_CHANGE',
              old_quantity: oldQty,
              new_quantity: newQty,
              reason: newItem.reason || 'Soni o\'zgardi',
              device
            }
          });

          // Per-item timeline entry
          if (tableId) {
            const changeText = changeQty > 0
              ? `${productName} soni oshdi: ${oldQty} → ${newQty}`
              : `${productName} soni kamaydi: ${oldQty} → ${newQty}`;
            await TableTimelineModel.create({
              data: {
                table_id: tableId.toString(),
                order_id: orderId,
                session_id: orderId,
                user_id: userId,
                action_type: changeQty > 0 ? 'ITEM_QTY_INCREASED' : 'ITEM_QTY_DECREASED',
                details: changeText,
                metadata: { product_name: productName, old_qty: oldQty, new_qty: newQty }
              }
            });
          }

          // Emit specific kitchen event
          if (changeQty > 0) {
            emitToAll('kitchen:item_quantity_changed', {
              order_id: orderId,
              product_id: newItem.product_id,
              product_name: productName,
              old_quantity: oldQty,
              new_quantity: newQty,
              delta: changeQty,
              type: 'INCREASE'
            });
          } else {
            emitToAll('kitchen:item_quantity_changed', {
              order_id: orderId,
              product_id: newItem.product_id,
              product_name: productName,
              old_quantity: oldQty,
              new_quantity: newQty,
              delta: changeQty,
              type: 'DECREASE'
            });
          }
        } else {
          // Item cancelled (quantity 0)
          await OrderItemModel.delete({ where: { id: existing.id } });

          await OrderItemHistoryModel.create({
            data: {
              order_id: orderId,
              branch_id: branchId,
              user_id: userId,
              product_id: newItem.product_id,
              product_name: productName,
              change_type: 'REMOVE',
              old_quantity: oldQty,
              new_quantity: 0,
              reason: newItem.reason || 'Bekor qilindi',
              device
            }
          });

          // Timeline for item removal
          if (tableId) {
            await TableTimelineModel.create({
              data: {
                table_id: tableId.toString(),
                order_id: orderId,
                session_id: orderId,
                user_id: userId,
                action_type: 'ITEM_REMOVED',
                details: `${productName} buyurtmadan olib tashlandi (${oldQty} ta)`,
                metadata: { product_name: productName, old_qty: oldQty }
              }
            });
          }

          emitToAll('kitchen:item_cancelled', {
            order_id: orderId,
            product_id: newItem.product_id,
            product_name: productName,
            quantity: oldQty
          });
        }
      } else if (newQty > 0) {
        // Brand new item added
        await OrderItemModel.create({
          data: {
            order_id: orderId,
            product_id: newItem.product_id,
            quantity: newQty,
            price: newItem.price,
            subtotal: newQty * newItem.price,
            kitchen_status: 'PENDING'
          }
        });

        await OrderItemHistoryModel.create({
          data: {
            order_id: orderId,
            branch_id: branchId,
            user_id: userId,
            product_id: newItem.product_id,
            product_name: productName,
            change_type: 'ADD',
            old_quantity: 0,
            new_quantity: newQty,
            reason: newItem.reason || 'Yangi qo\'shildi',
            device
          }
        });

        // Timeline for new item
        if (tableId) {
          await TableTimelineModel.create({
            data: {
              table_id: tableId.toString(),
              order_id: orderId,
              session_id: orderId,
              user_id: userId,
              action_type: 'ITEM_ADDED',
              details: `${productName} qo'shildi (${newQty} ta)`,
              metadata: { product_name: productName, quantity: newQty, price: newItem.price }
            }
          });
        }

        emitToAll('kitchen:item_added', {
          order_id: orderId,
          product_id: newItem.product_id,
          product_name: productName,
          quantity: newQty
        });
      }

      totalAmount += newQty * newItem.price;
    }

    // Update order amounts
    const discountAmount = order.discount_amount || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const updatedOrder = await OrderModel.update({
      where: { id: orderId },
      data: {
        total_amount: totalAmount,
        final_amount: finalAmount
      }
    });

    emitToAll('order:updated', { order_id: orderId });
    if (tableId) {
      emitToAll('table:status_changed', { table_id: tableId });
    }

    await logAuditAction(userId, 'ORDER_ITEMS_EDITED', 'Order', orderId, null, items);
    return updatedOrder;
  },

  /**
   * Freeze a table — table remains occupied but protected from accidental closure.
   * Records who froze it, when, and why.
   */
  async freezeTable(tableId: string, userId: string, reason: string = ''): Promise<any> {
    const table = await TableModel.update({
      where: { id: tableId },
      data: {
        status: 'FROZEN',
        is_frozen: true,
        frozen_at: new Date(),
        frozen_by: userId,
        frozen_reason: reason || 'Muzlatildi'
      }
    });

    await TableTimelineModel.create({
      data: {
        table_id: tableId,
        user_id: userId,
        action_type: 'TABLE_FROZEN',
        details: `Stol muzlatib qo'yildi${reason ? ': ' + reason : ''}`,
        metadata: { reason, frozen_by: userId }
      }
    });

    await logAuditAction(userId, 'TABLE_FROZEN', 'RestaurantTable', tableId, null, { status: 'FROZEN', reason });
    emitToAll('table:status_changed', { table_id: tableId });
    return table;
  },

  /**
   * Unfreeze a table — determines next status based on active sessions.
   */
  async unfreezeTable(tableId: string, userId: string): Promise<any> {
    const activeSessions = await getActiveSessionsForTable(tableId);
    const nextStatus = activeSessions.length > 0 ? 'OCCUPIED' : 'AVAILABLE';

    const table = await TableModel.update({
      where: { id: tableId },
      data: {
        status: nextStatus,
        is_frozen: false,
        frozen_at: null,
        frozen_by: null,
        frozen_reason: null
      }
    });

    await TableTimelineModel.create({
      data: {
        table_id: tableId,
        user_id: userId,
        action_type: 'TABLE_UNFROZEN',
        details: `Stol muzlatishdan chiqarildi. Holati: ${nextStatus === 'OCCUPIED' ? 'Band' : 'Bo\'sh'}`,
        metadata: { new_status: nextStatus }
      }
    });

    await logAuditAction(userId, 'TABLE_UNFROZEN', 'RestaurantTable', tableId, null, { status: nextStatus });
    emitToAll('table:status_changed', { table_id: tableId });
    return table;
  },

  /**
   * Pay and close a single session.
   * Table stays OCCUPIED if other active sessions remain.
   * Table becomes AVAILABLE only when ALL sessions are closed (and table is not frozen).
   */
  async payAndCloseSession(
    orderId: string,
    userId: string,
    amountPaid: number,
    paymentMethod: 'CASH' | 'CARD' | 'MOBILE',
    discountId?: string,
    discountAmount?: number
  ): Promise<any> {
    // Validate user privileges
    const user = await UserModel.findFirst({ where: { id: userId } });
    if (user && user.role === 'WAITER') {
      throw new Error('Ruxsat berilmadi: Ofitsiant buyurtma to\'lovini qabul qila olmaydi');
    }

    const order = await OrderModel.findFirst({
      where: { id: orderId },
      include: {
        order_items: true
      }
    });
    if (!order) throw new Error('Order topilmadi');
    if (order.session_status !== 'ACTIVE') throw new Error('Bu sessiya allaqachon yopilgan');

    const tableId = order.table_id;
    const branchId = order.branch_id;

    // 1. Update order status to COMPLETED and session_status to PAID
    const updatedOrder = await OrderModel.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        session_status: 'PAID',
        discount_id: discountId || null,
        discount_amount: discountAmount || 0,
        final_amount: amountPaid,
        closed_at: new Date(),
        closed_by: userId
      }
    });

    // 2. Create Payment record
    await PaymentModel.create({
      data: {
        order_id: orderId,
        amount: amountPaid,
        payment_method: paymentMethod,
        paid_at: new Date()
      }
    });

    // 3. Subtract inventory based on recipes
    await InventoryService.deductRecipeForOrder(order, userId);

    // 4. Log Cash drawer movement if there is an active shift
    const activeShift = await CashService.getActiveShift(branchId.toString());
    if (activeShift) {
      await CashService.handleOrderPayment(
        activeShift.id,
        userId,
        amountPaid,
        orderId,
        paymentMethod
      );
    }

    // 5. Log Table Timeline
    if (tableId) {
      await TableTimelineModel.create({
        data: {
          table_id: tableId.toString(),
          order_id: orderId,
          session_id: orderId,
          user_id: userId,
          action_type: 'SESSION_PAID',
          details: `Sessiya to'landi: ${amountPaid} so'm (${paymentMethod})`,
          metadata: { amount: amountPaid, method: paymentMethod, session_name: order.session_name }
        }
      });

      // Check if there are any other active sessions left for this table
      const remainingActiveSessions = await getActiveSessionsForTable(tableId.toString());

      if (remainingActiveSessions.length === 0) {
        // Table becomes AVAILABLE if it is not frozen
        const currentTable = await TableModel.findFirst({ where: { id: tableId } });
        if (currentTable && currentTable.status !== 'FROZEN') {
          await TableModel.update({
            where: { id: tableId },
            data: { status: 'AVAILABLE', is_frozen: false }
          });
        }

        await TableTimelineModel.create({
          data: {
            table_id: tableId.toString(),
            user_id: userId,
            action_type: 'TABLE_CLOSED',
            details: 'Barcha sessiyalar yopildi — stol bo\'shadi'
          }
        });
      }
    }

    await logAuditAction(userId, 'SESSION_CLOSED', 'Order', orderId, order, updatedOrder);
    emitToAll('order:updated', { order_id: orderId });
    if (tableId) {
      emitToAll('table:status_changed', { table_id: tableId });
    }

    return updatedOrder;
  },

  /**
   * Move an order item from one session to another on the same table.
   */
  async moveItemBetweenSessions(
    fromOrderId: string,
    toOrderId: string,
    productId: string,
    quantity: number,
    userId: string,
    reason: string = '',
    device: string = 'POS'
  ): Promise<any> {
    const fromOrder = await OrderModel.findFirst({ where: { id: fromOrderId } });
    if (!fromOrder) throw new Error('Manba sessiya topilmadi');
    if (fromOrder.session_status !== 'ACTIVE') throw new Error('Manba sessiya yopilgan');

    const toOrder = await OrderModel.findFirst({ where: { id: toOrderId } });
    if (!toOrder) throw new Error('Maqsad sessiya topilmadi');
    if (toOrder.session_status !== 'ACTIVE') throw new Error('Maqsad sessiya yopilgan');

    // Ensure both orders belong to the same table
    if (fromOrder.table_id?.toString() !== toOrder.table_id?.toString()) {
      throw new Error('Sessiyalar bir xil stolga tegishli emas');
    }

    // Find the item in the source order
    const sourceItem = await OrderItemModel.findFirst({
      where: { order_id: fromOrderId, product_id: productId }
    });
    if (!sourceItem) throw new Error('Mahsulot manba sessiyada topilmadi');
    if (sourceItem.quantity < quantity) throw new Error('Yetarli sondagi mahsulot yo\'q');

    // Resolve product name
    let productName = '';
    try {
      const product = await ProductModel.findFirst({ where: { id: productId } });
      if (product) productName = product.name;
    } catch {}

    // Deduct from source
    const remainingQty = sourceItem.quantity - quantity;
    if (remainingQty > 0) {
      await OrderItemModel.update({
        where: { id: sourceItem.id },
        data: { quantity: remainingQty, subtotal: remainingQty * sourceItem.price }
      });
    } else {
      await OrderItemModel.delete({ where: { id: sourceItem.id } });
    }

    // Add to destination
    const destItem = await OrderItemModel.findFirst({
      where: { order_id: toOrderId, product_id: productId }
    });
    if (destItem) {
      const newQty = destItem.quantity + quantity;
      await OrderItemModel.update({
        where: { id: destItem.id },
        data: { quantity: newQty, subtotal: newQty * destItem.price }
      });
    } else {
      await OrderItemModel.create({
        data: {
          order_id: toOrderId,
          product_id: productId,
          quantity: quantity,
          price: sourceItem.price,
          subtotal: quantity * sourceItem.price,
          kitchen_status: sourceItem.kitchen_status
        }
      });
    }

    // Log history for both sessions
    const historyBase = {
      branch_id: fromOrder.branch_id,
      user_id: userId,
      product_id: productId,
      product_name: productName,
      change_type: 'MOVE' as const,
      reason: reason || `Sessiyalar orasida ko'chirildi`,
      device
    };

    await OrderItemHistoryModel.create({
      data: { ...historyBase, order_id: fromOrderId, old_quantity: sourceItem.quantity, new_quantity: remainingQty }
    });
    await OrderItemHistoryModel.create({
      data: { ...historyBase, order_id: toOrderId, old_quantity: destItem?.quantity || 0, new_quantity: (destItem?.quantity || 0) + quantity }
    });

    // Recalculate totals for both orders
    for (const ordId of [fromOrderId, toOrderId]) {
      const allItems = await OrderItemModel.findMany({ where: { order_id: ordId } });
      const total = allItems.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
      const ord = await OrderModel.findFirst({ where: { id: ordId } });
      const disc = ord?.discount_amount || 0;
      await OrderModel.update({
        where: { id: ordId },
        data: { total_amount: total, final_amount: Math.max(0, total - disc) }
      });
    }

    // Timeline
    const tableId = fromOrder.table_id;
    if (tableId) {
      await TableTimelineModel.create({
        data: {
          table_id: tableId.toString(),
          order_id: fromOrderId,
          session_id: fromOrderId,
          user_id: userId,
          action_type: 'ITEM_MOVED',
          details: `${productName} (${quantity} ta) "${fromOrder.session_name}" → "${toOrder.session_name}" ga ko'chirildi`,
          metadata: {
            product_name: productName,
            quantity,
            from_session: fromOrder.session_name,
            to_session: toOrder.session_name
          }
        }
      });
    }

    await logAuditAction(userId, 'ORDER_ITEM_MOVED', 'Order', fromOrderId, null, {
      from_order: fromOrderId, to_order: toOrderId, product_id: productId, quantity
    });

    emitToAll('order:updated', { order_id: fromOrderId });
    emitToAll('order:updated', { order_id: toOrderId });
    if (tableId) {
      emitToAll('table:status_changed', { table_id: tableId });
    }

    return { from_order: fromOrderId, to_order: toOrderId, product_id: productId, quantity };
  },

  /**
   * Get all sessions (orders) for a table, both active and completed
   */
  async getTableSessions(tableId: string): Promise<any> {
    const sessions = await OrderModel.findMany({
      where: {
        table_id: tableId,
        is_deleted: false
      }
    });

    // Populate items for each session
    const result = [];
    for (const session of sessions) {
      const items = await OrderItemModel.findMany({
        where: { order_id: session.id }
      });
      result.push({ ...session, items });
    }

    return result;
  },

  /**
   * Get only active sessions for a table
   */
  async getActiveTableSessions(tableId: string): Promise<any> {
    const sessions = await getActiveSessionsForTable(tableId);

    const result = [];
    for (const session of sessions) {
      const items = await OrderItemModel.findMany({
        where: { order_id: session.id }
      });
      result.push({ ...session, items });
    }

    return result;
  },

  /**
   * Get detailed session info with items, history, and timeline
   */
  async getSessionDetails(orderId: string): Promise<any> {
    const order = await OrderModel.findFirst({ where: { id: orderId } });
    if (!order) throw new Error('Order topilmadi');

    const items = await OrderItemModel.findMany({ where: { order_id: orderId } });

    // Populate product names for items
    const populatedItems = [];
    for (const item of items) {
      let productName = '';
      try {
        const product = await ProductModel.findFirst({ where: { id: item.product_id } });
        if (product) productName = product.name;
      } catch {}
      populatedItems.push({ ...item, product_name: productName });
    }

    const history = await OrderItemHistoryModel.findMany({
      where: { order_id: orderId }
    });

    let timeline: any[] = [];
    if (order.table_id) {
      timeline = await TableTimelineModel.findMany({
        where: { table_id: order.table_id, session_id: orderId }
      });
    }

    return {
      ...order,
      items: populatedItems,
      history,
      timeline
    };
  },

  /**
   * Close a table — only when all sessions are completed/paid.
   * Only Cashier or Manager may close.
   */
  async closeTable(tableId: string, userId: string): Promise<any> {
    // Validate user role
    const user = await UserModel.findFirst({ where: { id: userId } });
    if (user && user.role === 'WAITER') {
      throw new Error('Ruxsat berilmadi: Ofitsiant stolni yopa olmaydi');
    }

    // Check for active sessions
    const activeSessions = await getActiveSessionsForTable(tableId);

    if (activeSessions.length > 0) {
      throw new Error(`Stolni yopib bo'lmaydi: ${activeSessions.length} ta faol sessiya mavjud`);
    }

    const table = await TableModel.update({
      where: { id: tableId },
      data: {
        status: 'AVAILABLE',
        is_frozen: false,
        frozen_at: null,
        frozen_by: null,
        frozen_reason: null
      }
    });

    await TableTimelineModel.create({
      data: {
        table_id: tableId,
        user_id: userId,
        action_type: 'TABLE_CLOSED',
        details: 'Stol yopildi'
      }
    });

    await logAuditAction(userId, 'TABLE_CLOSED', 'RestaurantTable', tableId, null, { status: 'AVAILABLE' });
    emitToAll('table:status_changed', { table_id: tableId });
    return table;
  },

  /**
   * Swap a product in an order item (e.g., Coke → Fanta)
   */
  async swapOrderItem(
    orderId: string,
    oldProductId: string,
    newProductId: string,
    userId: string,
    reason: string = '',
    device: string = 'POS'
  ): Promise<any> {
    const order = await OrderModel.findFirst({ where: { id: orderId } });
    if (!order) throw new Error('Order topilmadi');
    if (order.session_status !== 'ACTIVE') throw new Error('Bu sessiya yopilgan, tahrirlash mumkin emas');

    const existingItem = await OrderItemModel.findFirst({
      where: { order_id: orderId, product_id: oldProductId }
    });
    if (!existingItem) throw new Error('Mahsulot buyurtmada topilmadi');

    // Get both product details
    const oldProduct = await ProductModel.findFirst({ where: { id: oldProductId } });
    const newProduct = await ProductModel.findFirst({ where: { id: newProductId } });
    if (!newProduct) throw new Error('Yangi mahsulot topilmadi');

    const oldPrice = existingItem.price;
    const newPrice = newProduct.price;
    const oldProductName = oldProduct?.name || '';
    const newProductName = newProduct.name || '';

    // Update the order item
    await OrderItemModel.update({
      where: { id: existingItem.id },
      data: {
        product_id: newProductId,
        price: newPrice,
        subtotal: existingItem.quantity * newPrice,
        kitchen_status: 'PENDING' // Reset to pending since product changed
      }
    });

    // Log history with SWAP type
    await OrderItemHistoryModel.create({
      data: {
        order_id: orderId,
        branch_id: order.branch_id,
        user_id: userId,
        product_id: newProductId,
        product_name: newProductName,
        change_type: 'SWAP',
        old_quantity: existingItem.quantity,
        new_quantity: existingItem.quantity,
        old_product_id: oldProductId,
        old_product_name: oldProductName,
        new_product_name: newProductName,
        old_price: oldPrice,
        new_price: newPrice,
        reason: reason || 'Mahsulot almashtirildi',
        device
      }
    });

    // Recalculate order totals
    const allItems = await OrderItemModel.findMany({ where: { order_id: orderId } });
    const totalAmount = allItems.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
    const discountAmount = order.discount_amount || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const updatedOrder = await OrderModel.update({
      where: { id: orderId },
      data: { total_amount: totalAmount, final_amount: finalAmount }
    });

    // Timeline
    if (order.table_id) {
      await TableTimelineModel.create({
        data: {
          table_id: order.table_id.toString(),
          order_id: orderId,
          session_id: orderId,
          user_id: userId,
          action_type: 'ITEM_SWAPPED',
          details: `${oldProductName} → ${newProductName} almashtirildi`,
          metadata: {
            old_product: oldProductName,
            new_product: newProductName,
            old_price: oldPrice,
            new_price: newPrice,
            reason
          }
        }
      });
    }

    emitToAll('kitchen:item_swapped', {
      order_id: orderId,
      old_product_id: oldProductId,
      old_product_name: oldProductName,
      new_product_id: newProductId,
      new_product_name: newProductName,
      quantity: existingItem.quantity
    });

    await logAuditAction(userId, 'ORDER_ITEM_SWAPPED', 'Order', orderId, { oldProductId, oldPrice }, { newProductId, newPrice });
    emitToAll('order:updated', { order_id: orderId });
    if (order.table_id) {
      emitToAll('table:status_changed', { table_id: order.table_id });
    }

    return updatedOrder;
  },

  /**
   * Get table timeline with all chronological events
   */
  async getTableTimeline(tableId: string, sessionId?: string): Promise<any> {
    const where: any = { table_id: tableId };
    if (sessionId) {
      where.session_id = sessionId;
    }
    return TableTimelineModel.findMany({ where });
  },

  /**
   * Transfer all active orders from one table to another table
   */
  async transferTableOrder(
    fromTableId: string,
    toTableId: string,
    userId: string,
    userName: string
  ): Promise<any> {
    const fromTable = await TableModel.findFirst({ where: { id: fromTableId } });
    const toTable = await TableModel.findFirst({ where: { id: toTableId } });
    if (!fromTable) throw new Error('Manba stol topilmadi');
    if (!toTable) throw new Error('Maqsad stol topilmadi');

    const activeOrders = await OrderModel.findMany({
      where: {
        table_id: fromTableId,
        status: { $nin: ['COMPLETED', 'CANCELLED'] }
      }
    });

    const targetActiveOrders = await OrderModel.findMany({
      where: {
        table_id: toTableId,
        status: { $nin: ['COMPLETED', 'CANCELLED'] }
      }
    });

    const isTargetOccupied = targetActiveOrders.length > 0;
    const nextSessionNum = targetActiveOrders.length + 1;

    for (let idx = 0; idx < activeOrders.length; idx++) {
      const order = activeOrders[idx];
      let newSessionName = order.session_name || 'Asosiy';
      let newSessionNum = order.session_number || 1;

      if (isTargetOccupied) {
        newSessionNum = nextSessionNum + idx;
        newSessionName = `Sessiya #${newSessionNum}`;
      } else if (idx === 0) {
        newSessionName = 'Asosiy';
        newSessionNum = 1;
      }

      await OrderModel.update({
        where: { id: order.id },
        data: {
          table_id: toTableId,
          session_name: newSessionName,
          session_number: newSessionNum
        }
      });
    }

    await TableModel.update({
      where: { id: fromTableId },
      data: { status: 'AVAILABLE' }
    });

    await TableModel.update({
      where: { id: toTableId },
      data: { status: 'OCCUPIED' }
    });

    try {
      const fromName = fromTable.table_number ? `${fromTable.table_number}-stol` : fromTable.id;
      const toName = toTable.table_number ? `${toTable.table_number}-stol` : toTable.id;
      const transferTypeNote = isTargetOccupied ? "yangi seans bo'lib qo'shildi" : "asosiy stol bo'lib ko'chirildi";
      
      await TableTimelineModel.create({
        data: {
          table_id: fromTableId,
          event_type: 'ORDER_CANCELLED',
          user_id: userId,
          note: `Buyurtmalar ${toName} ga ko'chirildi (${transferTypeNote})`
        }
      });

      await TableTimelineModel.create({
        data: {
          table_id: toTableId,
          event_type: 'ORDER_CREATED',
          user_id: userId,
          note: `Stol almashtirildi: ${fromName} -> ${toName} (${transferTypeNote}, ${userName} tomonidan)`
        }
      });
    } catch (e) {
      console.error("Timeline log error on table transfer:", e);
    }

    emitToAll('table:status_changed', { table_id: fromTableId });
    emitToAll('table:status_changed', { table_id: toTableId });

    return { 
      success: true, 
      isTargetOccupied,
      message: isTargetOccupied 
        ? `Buyurtma maqsad stolga yangi SEANS bo'lib qo'shildi` 
        : `Buyurtma maqsad stolga ko'chirildi` 
    };
  }
};
