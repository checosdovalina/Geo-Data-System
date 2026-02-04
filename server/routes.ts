import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCenterSchema, 
  insertDepartmentSchema, 
  insertDocumentSchema,
  insertDocumentVersionSchema,
  insertIncidentSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Utility function to log audit events
  async function logAudit(req: Request, action: string, entityType: string, entityId: string | null, entityName: string | null, details?: string) {
    try {
      await storage.createAuditLog({
        userId: null,
        userName: "Admin Usuario",
        action,
        entityType,
        entityId,
        entityName,
        details,
        ipAddress: req.ip || req.socket.remoteAddress || null,
      });
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }

  // Centers
  app.get("/api/centers", async (req: Request, res: Response) => {
    try {
      const centers = await storage.getCenters();
      res.json(centers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch centers" });
    }
  });

  app.get("/api/centers/:id", async (req: Request, res: Response) => {
    try {
      const center = await storage.getCenter(req.params.id);
      if (!center) {
        return res.status(404).json({ error: "Center not found" });
      }
      await logAudit(req, "view", "center", center.id, center.name);
      res.json(center);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch center" });
    }
  });

  app.post("/api/centers", async (req: Request, res: Response) => {
    try {
      const parsed = insertCenterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const center = await storage.createCenter(parsed.data);
      await logAudit(req, "create", "center", center.id, center.name, `Tipo: ${center.type}, Estado: ${center.state}`);
      res.status(201).json(center);
    } catch (error) {
      res.status(500).json({ error: "Failed to create center" });
    }
  });

  app.patch("/api/centers/:id", async (req: Request, res: Response) => {
    try {
      const center = await storage.updateCenter(req.params.id, req.body);
      if (!center) {
        return res.status(404).json({ error: "Center not found" });
      }
      await logAudit(req, "update", "center", center.id, center.name, "Centro actualizado");
      res.json(center);
    } catch (error) {
      res.status(500).json({ error: "Failed to update center" });
    }
  });

  // Departments
  app.get("/api/departments", async (req: Request, res: Response) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", async (req: Request, res: Response) => {
    try {
      const parsed = insertDepartmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const department = await storage.createDepartment(parsed.data);
      await logAudit(req, "create", "department", department.id, department.name);
      res.status(201).json(department);
    } catch (error) {
      res.status(500).json({ error: "Failed to create department" });
    }
  });

  // Documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      await logAudit(req, "view", "document", document.id, document.name);
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const parsed = insertDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const document = await storage.createDocument(parsed.data);
      await logAudit(req, "create", "document", document.id, document.name, `Tipo: ${document.type}`);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Document Versions
  app.get("/api/documents/:id/versions", async (req: Request, res: Response) => {
    try {
      const versions = await storage.getDocumentVersions(req.params.id);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document versions" });
    }
  });

  app.post("/api/documents/:id/versions", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      const versionData = {
        ...req.body,
        documentId: req.params.id,
        version: document.currentVersion + 1,
      };
      
      const parsed = insertDocumentVersionSchema.safeParse(versionData);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const version = await storage.createDocumentVersion(parsed.data);
      await logAudit(req, "version", "document", document.id, document.name, `Nueva versión ${version.version}: ${version.changeReason}`);
      res.status(201).json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document version" });
    }
  });

  // Users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Audit Logs
  app.get("/api/audit-logs", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Incidents
  app.get("/api/incidents", async (req: Request, res: Response) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incidents" });
    }
  });

  app.get("/api/incidents/:id", async (req: Request, res: Response) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch incident" });
    }
  });

  app.post("/api/incidents", async (req: Request, res: Response) => {
    try {
      const parsed = insertIncidentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const incident = await storage.createIncident(parsed.data);
      await logAudit(req, "create", "incident", incident.id, incident.title, `Tipo: ${incident.type}`);
      res.status(201).json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to create incident" });
    }
  });

  app.patch("/api/incidents/:id", async (req: Request, res: Response) => {
    try {
      const incident = await storage.updateIncident(req.params.id, req.body);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      await logAudit(req, "update", "incident", incident.id, incident.title, `Estado: ${incident.status}`);
      res.json(incident);
    } catch (error) {
      res.status(500).json({ error: "Failed to update incident" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: Request, res: Response) => {
    try {
      await storage.markAllNotificationsAsRead();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  return httpServer;
}
