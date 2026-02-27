import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { 
  insertCenterSchema, 
  insertDepartmentSchema, 
  insertDocumentSchema,
  insertDocumentVersionSchema,
  insertIncidentSchema,
  insertNotificationSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Utility function to log audit events
  async function logAudit(req: Request, action: string, entityType: string, entityId: string | null, entityName: string | null, details?: string) {
    try {
      await storage.createAuditLog({
        userId: req.session?.userId || null,
        userName: req.session?.fullName || "Sistema",
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

  // Object Storage routes for file uploads
  registerObjectStorageRoutes(app);

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Correo y contraseña son requeridos" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: "Tu cuenta está desactivada. Contacta al administrador." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.fullName = user.fullName;
      req.session.role = user.role;

      await logAudit(req, "login", "user", user.id, user.fullName, "Inicio de sesión exitoso");

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const fullName = req.session.fullName;
      if (userId) {
        await logAudit(req, "logout", "user", userId, fullName || null, "Cierre de sesión");
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Error al cerrar sesión" });
        }
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    } catch (error) {
      res.status(500).json({ error: "Error al cerrar sesión" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "No autenticado" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener sesión" });
    }
  });

  // Settings
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: "key and value are required" });
      }
      const setting = await storage.upsertSetting(key, value);
      await logAudit(req, "update", "setting", setting.id, key, `Configuración actualizada: ${key}`);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

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

  // Users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      await logAudit(req, "list", "user", null, null, `Listado de ${users.length} usuarios`);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await logAudit(req, "view", "user", user.id, user.fullName);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const existingUser = await storage.getUserByUsername(parsed.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "El nombre de usuario ya existe" });
      }
      
      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({ ...parsed.data, password: hashedPassword });
      await logAudit(req, "create", "user", user.id, user.fullName, `Rol: ${user.role}`);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  const updateUserSchema = z.object({
    username: z.string().min(3).optional(),
    password: z.string().min(6).optional(),
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(["super_admin", "admin", "auxiliar", "viewer", "auditor"]).optional(),
    departmentId: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
  }).strict();

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const existingUser = await storage.getUser(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const updateData = { ...parsed.data };
      
      if (updateData.username && updateData.username !== existingUser.username) {
        const usernameExists = await storage.getUserByUsername(updateData.username);
        if (usernameExists) {
          return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const action = updateData.isActive === false ? "deactivate" : 
                     updateData.isActive === true ? "activate" : "update";
      await logAudit(req, action, "user", user.id, user.fullName, `Rol: ${user.role}`);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
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

  app.get("/api/documents/:id/current-version", async (req: Request, res: Response) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Documento no encontrado" });
      }
      const versions = await storage.getDocumentVersions(req.params.id);
      if (versions.length === 0) {
        return res.status(404).json({ error: "No hay versiones disponibles" });
      }
      const currentVersion = versions.find(v => v.version === document.currentVersion && v.approvalStatus === 'approved');
      if (currentVersion) {
        return res.json(currentVersion);
      }
      const latestApproved = versions.find(v => v.approvalStatus === 'approved');
      if (latestApproved) {
        return res.json(latestApproved);
      }
      return res.json(versions[0]);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la versión actual" });
    }
  });

  // Document Versions (only show approved versions to regular users)
  app.get("/api/documents/:id/versions", async (req: Request, res: Response) => {
    try {
      const showAll = req.query.showAll === 'true'; // For admin users
      const versions = await storage.getDocumentVersions(req.params.id);
      // Filter to only approved versions for regular users
      const filteredVersions = showAll ? versions : versions.filter(v => v.approvalStatus === 'approved');
      res.json(filteredVersions);
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
      
      // Get highest version number from existing versions
      const versions = await storage.getDocumentVersions(req.params.id);
      const highestVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0;
      
      const versionData = {
        ...req.body,
        documentId: req.params.id,
        version: highestVersion + 1,
      };
      
      const parsed = insertDocumentVersionSchema.safeParse(versionData);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const version = await storage.createDocumentVersion(parsed.data);
      await logAudit(req, "version", "document", document.id, document.name, `Nueva versión ${version.version} pendiente de aprobación: ${version.changeReason}`);
      res.status(201).json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document version" });
    }
  });

  // Pending approvals
  app.get("/api/pending-approvals", async (req: Request, res: Response) => {
    try {
      const departmentId = req.query.departmentId as string | undefined;
      const pendingVersions = await storage.getPendingVersions(departmentId);
      res.json(pendingVersions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.get("/api/approved-versions", async (req: Request, res: Response) => {
    try {
      const departmentId = req.query.departmentId as string | undefined;
      const approvedVersions = await storage.getApprovedVersions(departmentId);
      res.json(approvedVersions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch approved versions" });
    }
  });

  app.get("/api/rejected-versions", async (req: Request, res: Response) => {
    try {
      const departmentId = req.query.departmentId as string | undefined;
      const rejectedVersions = await storage.getRejectedVersions(departmentId);
      res.json(rejectedVersions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rejected versions" });
    }
  });

  app.post("/api/versions/:id/approve", async (req: Request, res: Response) => {
    try {
      const version = await storage.approveVersion(req.params.id, "Admin Usuario");
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      
      const document = await storage.getDocument(version.documentId);
      await logAudit(req, "approve", "document_version", version.id, document?.name || "Documento", `Versión ${version.version} aprobada`);
      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve version" });
    }
  });

  app.post("/api/versions/:id/reject", async (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      if (!reason || reason.length < 5) {
        return res.status(400).json({ error: "Rejection reason is required (min 5 characters)" });
      }
      
      const version = await storage.rejectVersion(req.params.id, "Admin Usuario", reason);
      if (!version) {
        return res.status(404).json({ error: "Version not found" });
      }
      
      const document = await storage.getDocument(version.documentId);
      await logAudit(req, "reject", "document_version", version.id, document?.name || "Documento", `Versión ${version.version} rechazada: ${reason}`);
      res.json(version);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject version" });
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
