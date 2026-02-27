import { storage } from "./storage";
import type { Document } from "@shared/schema";

async function getAdminUserIds(): Promise<string[]> {
  const users = await storage.getUsers();
  return users
    .filter(u => u.isActive && (u.role === 'super_admin' || u.role === 'admin'))
    .map(u => u.id);
}

function getDaysUntilExpiration(expirationDate: Date): number {
  const now = new Date();
  const diff = expirationDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyLabel(days: number): string {
  if (days <= 0) return "VENCIDO";
  if (days <= 7) return "CRÍTICO";
  if (days <= 15) return "URGENTE";
  return "ADVERTENCIA";
}

async function sendReminder(doc: Document, level: '30' | '15' | '7' | 'expired', daysLeft: number) {
  const adminIds = await getAdminUserIds();
  const urgency = getUrgencyLabel(daysLeft);

  const title = daysLeft <= 0
    ? `⚠️ Documento vencido: ${doc.name}`
    : `🔔 ${urgency}: ${doc.name} vence en ${daysLeft} días`;

  const message = daysLeft <= 0
    ? `El documento "${doc.name}" (${doc.type}) ha vencido. Se requiere acción inmediata para renovar o actualizar este documento.`
    : `El documento "${doc.name}" (${doc.type}) vence el ${doc.expirationDate!.toLocaleDateString('es-MX', { dateStyle: 'long' })}. Quedan ${daysLeft} días para su vencimiento.`;

  const notificationType = daysLeft <= 0 ? 'document_expired' : 'document_expiring';

  for (const userId of adminIds) {
    await storage.createNotification({
      userId,
      title,
      message,
      type: notificationType,
      relatedEntityType: 'document',
      relatedEntityId: doc.id,
    });
  }

  if (daysLeft <= 0) {
    const centers = await storage.getCenters();
    const center = centers.find(c => c.id === doc.centerId);
    await storage.createIncident({
      type: 'document_observed',
      title: `Documento vencido: ${doc.name}`,
      description: `El documento "${doc.name}" (${doc.type}) del centro "${center?.name || 'Desconocido'}" ha vencido el ${doc.expirationDate!.toLocaleDateString('es-MX', { dateStyle: 'long' })}. Se requiere renovación o actualización.`,
      centerId: doc.centerId,
      documentId: doc.id,
      createdByName: 'Sistema Automático',
    });
  }

  await storage.markReminderSent(doc.id, level);
}

export async function checkExpiringDocuments() {
  try {
    const allDocs = await storage.getExpiringDocuments(30);
    const expiredDocs = await storage.getExpiredDocuments();

    for (const doc of expiredDocs) {
      if (!doc.reminderSentExpired) {
        const days = getDaysUntilExpiration(doc.expirationDate!);
        await sendReminder(doc, 'expired', days);
      }
    }

    for (const doc of allDocs) {
      const days = getDaysUntilExpiration(doc.expirationDate!);

      if (days <= 7 && !doc.reminderSent7) {
        await sendReminder(doc, '7', days);
      } else if (days <= 15 && !doc.reminderSent15) {
        await sendReminder(doc, '15', days);
      } else if (days <= 30 && !doc.reminderSent30) {
        await sendReminder(doc, '30', days);
      }
    }

    console.log(`[expiration-checker] Revisados ${allDocs.length + expiredDocs.length} documentos con fecha de vencimiento`);
  } catch (error) {
    console.error("[expiration-checker] Error al revisar documentos:", error);
  }
}

export function startExpirationChecker() {
  checkExpiringDocuments();
  const INTERVAL_MS = 6 * 60 * 60 * 1000;
  setInterval(checkExpiringDocuments, INTERVAL_MS);
  console.log("[expiration-checker] Revisión automática de vencimientos iniciada (cada 6 horas)");
}
