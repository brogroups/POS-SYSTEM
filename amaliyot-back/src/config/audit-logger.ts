import { AuditLogModel } from '../models/audit-log.model';

export async function logAuditAction(
  userId: string | undefined,
  action: string,
  tableName: string,
  recordId: string,
  oldData?: any,
  newData?: any,
  branchId: string = '000000000000000000000001'
) {
  try {
    await AuditLogModel.create({
      data: {
        branch_id: branchId,
        user_id: userId || null,
        action,
        table_name: tableName,
        record_id: recordId,
        old_data: oldData ? (typeof oldData === 'string' ? oldData : JSON.stringify(oldData)) : undefined,
        new_data: newData ? (typeof newData === 'string' ? newData : JSON.stringify(newData)) : undefined
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
