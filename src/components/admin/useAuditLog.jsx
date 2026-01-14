import { base44 } from '@/api/base44Client';

export async function logAuditAction(user, action, entityType, entityId, details = {}) {
  try {
    await base44.entities.AuditLog.create({
      user_id: user?.id,
      user_email: user?.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

export default logAuditAction;