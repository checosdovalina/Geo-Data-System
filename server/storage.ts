import { 
  type User, type InsertUser,
  type Center, type InsertCenter,
  type Department, type InsertDepartment,
  type Document, type InsertDocument,
  type DocumentVersion, type InsertDocumentVersion,
  type AuditLog, type InsertAuditLog,
  type Incident, type InsertIncident,
  type Notification, type InsertNotification,
  users, centers, departments, documents, documentVersions, auditLogs, incidents, notifications
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Centers
  getCenters(): Promise<Center[]>;
  getCenter(id: string): Promise<Center | undefined>;
  createCenter(center: InsertCenter): Promise<Center>;
  updateCenter(id: string, center: Partial<InsertCenter>): Promise<Center | undefined>;
  
  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  
  // Document Versions
  getDocumentVersions(documentId: string): Promise<DocumentVersion[]>;
  getDocumentVersion(id: string): Promise<DocumentVersion | undefined>;
  getPendingVersions(departmentId?: string): Promise<DocumentVersion[]>;
  getApprovedVersions(departmentId?: string): Promise<DocumentVersion[]>;
  getRejectedVersions(departmentId?: string): Promise<DocumentVersion[]>;
  createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion>;
  approveVersion(id: string, approvedBy: string): Promise<DocumentVersion | undefined>;
  rejectVersion(id: string, rejectedBy: string, reason: string): Promise<DocumentVersion | undefined>;
  
  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  // Incidents
  getIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, incident: Partial<Incident>): Promise<Incident | undefined>;
  
  // Notifications
  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Centers
  async getCenters(): Promise<Center[]> {
    return db.select().from(centers).orderBy(desc(centers.createdAt));
  }

  async getCenter(id: string): Promise<Center | undefined> {
    const [center] = await db.select().from(centers).where(eq(centers.id, id));
    return center;
  }

  async createCenter(center: InsertCenter): Promise<Center> {
    const [created] = await db.insert(centers).values(center).returning();
    return created;
  }

  async updateCenter(id: string, center: Partial<InsertCenter>): Promise<Center | undefined> {
    const [updated] = await db.update(centers)
      .set({ ...center, updatedAt: new Date() })
      .where(eq(centers.id, id))
      .returning();
    return updated;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [dept] = await db.select().from(departments).where(eq(departments.id, id));
    return dept;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(document).returning();
    return created;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db.update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }

  // Document Versions
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return db.select().from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.version));
  }

  async getDocumentVersion(id: string): Promise<DocumentVersion | undefined> {
    const [version] = await db.select().from(documentVersions).where(eq(documentVersions.id, id));
    return version;
  }

  async getPendingVersions(departmentId?: string): Promise<DocumentVersion[]> {
    if (departmentId) {
      // Get document IDs for the department first
      const deptDocs = await db.select().from(documents).where(eq(documents.departmentId, departmentId));
      const docIds = deptDocs.map(d => d.id);
      if (docIds.length === 0) return [];
      
      const allPending = await db.select().from(documentVersions)
        .where(eq(documentVersions.approvalStatus, "pending"))
        .orderBy(desc(documentVersions.uploadedAt));
      
      return allPending.filter(v => docIds.includes(v.documentId));
    }
    return db.select().from(documentVersions)
      .where(eq(documentVersions.approvalStatus, "pending"))
      .orderBy(desc(documentVersions.uploadedAt));
  }

  async getApprovedVersions(departmentId?: string): Promise<DocumentVersion[]> {
    if (departmentId) {
      const deptDocs = await db.select().from(documents).where(eq(documents.departmentId, departmentId));
      const docIds = deptDocs.map(d => d.id);
      if (docIds.length === 0) return [];
      
      const allApproved = await db.select().from(documentVersions)
        .where(eq(documentVersions.approvalStatus, "approved"))
        .orderBy(desc(documentVersions.approvedAt));
      
      return allApproved.filter(v => docIds.includes(v.documentId));
    }
    return db.select().from(documentVersions)
      .where(eq(documentVersions.approvalStatus, "approved"))
      .orderBy(desc(documentVersions.approvedAt));
  }

  async getRejectedVersions(departmentId?: string): Promise<DocumentVersion[]> {
    if (departmentId) {
      const deptDocs = await db.select().from(documents).where(eq(documents.departmentId, departmentId));
      const docIds = deptDocs.map(d => d.id);
      if (docIds.length === 0) return [];
      
      const allRejected = await db.select().from(documentVersions)
        .where(eq(documentVersions.approvalStatus, "rejected"))
        .orderBy(desc(documentVersions.uploadedAt));
      
      return allRejected.filter(v => docIds.includes(v.documentId));
    }
    return db.select().from(documentVersions)
      .where(eq(documentVersions.approvalStatus, "rejected"))
      .orderBy(desc(documentVersions.uploadedAt));
  }

  async createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion> {
    const [created] = await db.insert(documentVersions).values(version).returning();
    
    // Note: Document's currentVersion will only be updated when version is approved
    // For now, we don't update the currentVersion until approval
    
    return created;
  }

  async approveVersion(id: string, approvedBy: string): Promise<DocumentVersion | undefined> {
    const [updated] = await db.update(documentVersions)
      .set({ 
        approvalStatus: "approved",
        approvedBy,
        approvedAt: new Date()
      })
      .where(eq(documentVersions.id, id))
      .returning();
    
    if (updated) {
      // Update document's current version to the approved version
      await db.update(documents)
        .set({ currentVersion: updated.version })
        .where(eq(documents.id, updated.documentId));
    }
    
    return updated;
  }

  async rejectVersion(id: string, rejectedBy: string, reason: string): Promise<DocumentVersion | undefined> {
    const [updated] = await db.update(documentVersions)
      .set({ 
        approvalStatus: "rejected",
        approvedBy: rejectedBy,
        approvedAt: new Date(),
        rejectionReason: reason
      })
      .where(eq(documentVersions.id, id))
      .returning();
    
    return updated;
  }

  // Audit Logs
  async getAuditLogs(limit?: number): Promise<AuditLog[]> {
    const query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: string): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [created] = await db.insert(incidents).values(incident).returning();
    return created;
  }

  async updateIncident(id: string, incident: Partial<Incident>): Promise<Incident | undefined> {
    const [updated] = await db.update(incidents)
      .set({ ...incident, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return updated;
  }

  // Notifications
  async getNotifications(userId?: string): Promise<Notification[]> {
    if (userId) {
      return db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    }
    return db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId?: string): Promise<void> {
    if (userId) {
      await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
    } else {
      await db.update(notifications).set({ read: true });
    }
  }
}

export const storage = new DatabaseStorage();
