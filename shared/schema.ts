import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "admin", "auxiliar", "viewer", "auditor"]);
export const centerStatusEnum = pgEnum("center_status", ["active", "inactive"]);
export const centerTypeEnum = pgEnum("center_type", ["centro", "edificio", "planta", "sucursal"]);
export const incidentStatusEnum = pgEnum("incident_status", ["pending", "approved", "rejected", "closed"]);
export const incidentTypeEnum = pgEnum("incident_type", ["approval_request", "document_observed", "missing_info", "sensitive_change"]);
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default("viewer"),
  departmentId: varchar("department_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Departments table
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mexican states for the map
export const mexicanStates = pgTable("mexican_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  centerCount: integer("center_count").default(0),
});

// Centers/Buildings table
export const centers = pgTable("centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: centerTypeEnum("type").notNull().default("centro"),
  status: centerStatusEnum("status").notNull().default("active"),
  state: text("state").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
});

// Documents table with versioning
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // escritura, predial, contrato, licencia, dictamen, reporte
  centerId: varchar("center_id").notNull(),
  departmentId: varchar("department_id").notNull(),
  currentVersion: integer("current_version").default(1).notNull(),
  expirationDate: timestamp("expiration_date"),
  reminderSent30: boolean("reminder_sent_30").default(false),
  reminderSent15: boolean("reminder_sent_15").default(false),
  reminderSent7: boolean("reminder_sent_7").default(false),
  reminderSentExpired: boolean("reminder_sent_expired").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by"),
});

// Document versions table
export const documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  version: integer("version").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  filePath: text("file_path"),
  changeReason: text("change_reason").notNull(),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default("pending"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  uploadedBy: varchar("uploaded_by"),
});

// Settings table for system configuration (e.g. Google Drive sync)
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  userName: text("user_name"),
  action: text("action").notNull(), // create, update, view, download, version
  entityType: text("entity_type").notNull(), // center, document, user, incident
  entityId: varchar("entity_id"),
  entityName: text("entity_name"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Incidents table
export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: incidentTypeEnum("type").notNull(),
  status: incidentStatusEnum("status").notNull().default("pending"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  centerId: varchar("center_id"),
  documentId: varchar("document_id"),
  createdBy: varchar("created_by"),
  createdByName: text("created_by_name"),
  assignedTo: varchar("assigned_to"),
  resolvedBy: varchar("resolved_by"),
  resolutionComment: text("resolution_comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // new_version, incident_created, incident_resolved
  read: boolean("read").default(false).notNull(),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: varchar("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertCenterSchema = createInsertSchema(centers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, currentVersion: true, reminderSent30: true, reminderSent15: true, reminderSent7: true, reminderSentExpired: true });
export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({ id: true, uploadedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, read: true });
export const insertMexicanStateSchema = createInsertSchema(mexicanStates).omit({ id: true });
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type Center = typeof centers.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertMexicanState = z.infer<typeof insertMexicanStateSchema>;
export type MexicanState = typeof mexicanStates.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
