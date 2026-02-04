import { db } from "./db";
import { 
  users, departments, centers, documents, documentVersions, 
  auditLogs, incidents, notifications 
} from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingCenters = await db.select().from(centers).limit(1);
    if (existingCenters.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Seed Departments
    const deptData = [
      { name: "Jurídico", description: "Gestión de asuntos legales y contratos", icon: "scale" },
      { name: "Fiscal / Impuestos", description: "Control de obligaciones fiscales y tributarias", icon: "calculator" },
      { name: "Operaciones", description: "Gestión operativa de centros", icon: "settings" },
      { name: "Mantenimiento", description: "Mantenimiento preventivo y correctivo", icon: "wrench" },
      { name: "Finanzas", description: "Control financiero y presupuestos", icon: "file" },
      { name: "Seguridad", description: "Protección civil y seguridad patrimonial", icon: "shield" },
      { name: "Administración", description: "Gestión administrativa general", icon: "users" },
    ];

    const insertedDepts = await db.insert(departments).values(deptData).returning();
    console.log(`Inserted ${insertedDepts.length} departments`);

    // Seed Users
    const userData = [
      { username: "admin", password: "admin123", fullName: "Carlos Rodríguez", email: "carlos.rodriguez@geodoc.mx", role: "super_admin" as const, departmentId: insertedDepts[0].id },
      { username: "legal_mgr", password: "legal123", fullName: "María García López", email: "maria.garcia@geodoc.mx", role: "admin" as const, departmentId: insertedDepts[0].id },
      { username: "fiscal_aux", password: "fiscal123", fullName: "José Hernández", email: "jose.hernandez@geodoc.mx", role: "auxiliar" as const, departmentId: insertedDepts[1].id },
      { username: "viewer1", password: "viewer123", fullName: "Ana Martínez", email: "ana.martinez@geodoc.mx", role: "viewer" as const, departmentId: insertedDepts[2].id },
      { username: "auditor1", password: "auditor123", fullName: "Roberto Sánchez", email: "roberto.sanchez@geodoc.mx", role: "auditor" as const, departmentId: null },
    ];

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`Inserted ${insertedUsers.length} users`);

    // Seed Centers
    const centerData = [
      { name: "Centro Comercial Santa Fe", type: "centro" as const, status: "active" as const, state: "Ciudad de México", city: "Ciudad de México", address: "Av. Vasco de Quiroga 3800, Santa Fe", latitude: "19.3597", longitude: "-99.2622", createdBy: insertedUsers[0].id },
      { name: "Torre Corporativa Monterrey", type: "edificio" as const, status: "active" as const, state: "Nuevo León", city: "Monterrey", address: "Av. Lázaro Cárdenas 2321, Del Valle", latitude: "25.6514", longitude: "-100.2895", createdBy: insertedUsers[0].id },
      { name: "Plaza Comercial Guadalajara", type: "centro" as const, status: "active" as const, state: "Jalisco", city: "Guadalajara", address: "Av. Vallarta 2425, Arcos Vallarta", latitude: "20.6736", longitude: "-103.3739", createdBy: insertedUsers[0].id },
      { name: "Sucursal Tijuana Norte", type: "sucursal" as const, status: "active" as const, state: "Baja California", city: "Tijuana", address: "Blvd. Agua Caliente 4558", latitude: "32.5027", longitude: "-117.0037", createdBy: insertedUsers[0].id },
      { name: "Planta Industrial Querétaro", type: "planta" as const, status: "active" as const, state: "Querétaro", city: "Querétaro", address: "Parque Industrial El Marqués, Lote 15", latitude: "20.5531", longitude: "-100.2214", createdBy: insertedUsers[0].id },
      { name: "Centro Logístico Veracruz", type: "centro" as const, status: "inactive" as const, state: "Veracruz", city: "Veracruz", address: "Puerto Industrial, Zona Norte", latitude: "19.1738", longitude: "-96.1342", createdBy: insertedUsers[0].id },
      { name: "Edificio Corporativo Mérida", type: "edificio" as const, status: "active" as const, state: "Yucatán", city: "Mérida", address: "Paseo de Montejo 450", latitude: "21.0190", longitude: "-89.6249", createdBy: insertedUsers[0].id },
      { name: "Plaza Comercial Cancún", type: "centro" as const, status: "active" as const, state: "Quintana Roo", city: "Cancún", address: "Blvd. Kukulcán Km 12.5, Zona Hotelera", latitude: "21.1213", longitude: "-86.7610", createdBy: insertedUsers[0].id },
    ];

    const insertedCenters = await db.insert(centers).values(centerData).returning();
    console.log(`Inserted ${insertedCenters.length} centers`);

    // Seed Documents
    const docData = [
      { name: "Escritura Pública Centro Santa Fe", type: "escritura", centerId: insertedCenters[0].id, departmentId: insertedDepts[0].id, createdBy: insertedUsers[1].id },
      { name: "Predial 2024 - Torre Monterrey", type: "predial", centerId: insertedCenters[1].id, departmentId: insertedDepts[1].id, createdBy: insertedUsers[2].id },
      { name: "Contrato Arrendamiento Plaza GDL", type: "contrato", centerId: insertedCenters[2].id, departmentId: insertedDepts[0].id, createdBy: insertedUsers[1].id },
      { name: "Licencia de Funcionamiento Tijuana", type: "licencia", centerId: insertedCenters[3].id, departmentId: insertedDepts[2].id, createdBy: insertedUsers[0].id },
      { name: "Dictamen Estructural Planta Querétaro", type: "dictamen", centerId: insertedCenters[4].id, departmentId: insertedDepts[3].id, createdBy: insertedUsers[0].id },
      { name: "Reporte Técnico Veracruz", type: "reporte", centerId: insertedCenters[5].id, departmentId: insertedDepts[3].id, createdBy: insertedUsers[0].id },
    ];

    const insertedDocs = await db.insert(documents).values(docData).returning();
    console.log(`Inserted ${insertedDocs.length} documents`);

    // Seed Document Versions
    const versionData = [
      { documentId: insertedDocs[0].id, version: 1, fileName: "escritura_santa_fe_v1.pdf", fileSize: 2048000, mimeType: "application/pdf", changeReason: "Documento inicial registrado", uploadedBy: insertedUsers[1].id },
      { documentId: insertedDocs[1].id, version: 1, fileName: "predial_monterrey_2024.pdf", fileSize: 512000, mimeType: "application/pdf", changeReason: "Pago de predial 2024", uploadedBy: insertedUsers[2].id },
      { documentId: insertedDocs[2].id, version: 1, fileName: "contrato_gdl_v1.pdf", fileSize: 1024000, mimeType: "application/pdf", changeReason: "Contrato original firmado", uploadedBy: insertedUsers[1].id },
      { documentId: insertedDocs[2].id, version: 2, fileName: "contrato_gdl_v2.pdf", fileSize: 1048000, mimeType: "application/pdf", changeReason: "Adendum con nuevas cláusulas", uploadedBy: insertedUsers[1].id },
    ];

    await db.insert(documentVersions).values(versionData);
    
    // Update document version counts
    await db.update(documents).set({ currentVersion: 2 }).where(sql`${documents.id} = ${insertedDocs[2].id}`);
    console.log(`Inserted document versions`);

    // Seed Incidents
    const incidentData = [
      { type: "approval_request" as const, title: "Aprobación de renovación de contrato GDL", description: "Se requiere aprobación para renovar el contrato de arrendamiento de Plaza Comercial Guadalajara por 3 años adicionales.", centerId: insertedCenters[2].id, documentId: insertedDocs[2].id, createdByName: "María García López" },
      { type: "document_observed" as const, title: "Predial vencido - Torre Monterrey", description: "El predial de Torre Corporativa Monterrey está próximo a vencer. Se requiere actualización.", centerId: insertedCenters[1].id, documentId: insertedDocs[1].id, createdByName: "José Hernández" },
      { type: "missing_info" as const, title: "Falta licencia de uso de suelo Tijuana", description: "No se encuentra en el sistema la licencia de uso de suelo para Sucursal Tijuana Norte.", centerId: insertedCenters[3].id, createdByName: "Roberto Sánchez" },
      { type: "sensitive_change" as const, title: "Cambio de propietario Centro Veracruz", description: "Se reporta cambio en la escritura del Centro Logístico Veracruz. Requiere revisión urgente.", centerId: insertedCenters[5].id, createdByName: "Carlos Rodríguez" },
    ];

    await db.insert(incidents).values(incidentData);
    console.log(`Inserted incidents`);

    // Seed Audit Logs
    const auditData = [
      { userName: "Carlos Rodríguez", action: "create", entityType: "center", entityId: insertedCenters[0].id, entityName: "Centro Comercial Santa Fe", details: "Centro creado", ipAddress: "192.168.1.100" },
      { userName: "María García López", action: "create", entityType: "document", entityId: insertedDocs[0].id, entityName: "Escritura Pública Centro Santa Fe", details: "Documento registrado", ipAddress: "192.168.1.101" },
      { userName: "José Hernández", action: "view", entityType: "document", entityId: insertedDocs[1].id, entityName: "Predial 2024 - Torre Monterrey", details: "Consulta de documento", ipAddress: "192.168.1.102" },
      { userName: "Ana Martínez", action: "download", entityType: "document", entityId: insertedDocs[2].id, entityName: "Contrato Arrendamiento Plaza GDL", details: "Descarga de versión 2", ipAddress: "192.168.1.103" },
      { userName: "María García López", action: "version", entityType: "document", entityId: insertedDocs[2].id, entityName: "Contrato Arrendamiento Plaza GDL", details: "Nueva versión 2: Adendum con nuevas cláusulas", ipAddress: "192.168.1.101" },
      { userName: "Roberto Sánchez", action: "view", entityType: "center", entityId: insertedCenters[3].id, entityName: "Sucursal Tijuana Norte", details: "Auditoría de centro", ipAddress: "192.168.1.104" },
    ];

    await db.insert(auditLogs).values(auditData);
    console.log(`Inserted audit logs`);

    // Seed Notifications
    const notificationData = [
      { userId: insertedUsers[0].id, title: "Nueva versión de documento", message: "Se ha subido una nueva versión del Contrato Arrendamiento Plaza GDL", type: "new_version", relatedEntityType: "document", relatedEntityId: insertedDocs[2].id },
      { userId: insertedUsers[0].id, title: "Incidente creado", message: "Se ha creado un nuevo incidente: Predial vencido - Torre Monterrey", type: "incident_created", relatedEntityType: "incident" },
      { userId: insertedUsers[1].id, title: "Solicitud de aprobación", message: "Hay una nueva solicitud de aprobación pendiente para el contrato de GDL", type: "incident_created", relatedEntityType: "incident" },
      { userId: insertedUsers[0].id, title: "Cambio sensible detectado", message: "Se ha reportado un cambio sensible en Centro Logístico Veracruz", type: "incident_created", relatedEntityType: "incident" },
      { userId: insertedUsers[2].id, title: "Documento actualizado", message: "El documento de Predial 2024 - Torre Monterrey requiere atención", type: "new_version", relatedEntityType: "document", relatedEntityId: insertedDocs[1].id },
    ];

    await db.insert(notifications).values(notificationData);
    console.log(`Inserted notifications`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
