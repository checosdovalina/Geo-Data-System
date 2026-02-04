# GeoDoc Center - Document Management & Building Governance System

## Overview
GeoDoc Center is a SaaS document management and governance system designed for managing buildings and centers across Mexico. It provides centralized document storage with versioning, complete audit trails, geographic visualization, and incident management workflows.

## Current State
MVP implementation is complete with the following modules:
- Dashboard with statistics overview
- Interactive Mexico map for geographic visualization
- Centers/Buildings management (CRUD)
- Document management with version control
- Departments organization
- Users and roles display
- Incidents and approvals workflow
- Complete audit logging
- Notifications system

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query v5
- **Routing**: Wouter

## Project Structure
```
├── client/src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── pages/
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── mexico-map.tsx   # Interactive Mexico map
│   │   ├── centers.tsx      # Centers management
│   │   ├── center-detail.tsx # Center detail with documents
│   │   ├── documents.tsx    # Document management
│   │   ├── departments.tsx  # Departments view
│   │   ├── users.tsx        # Users and roles
│   │   ├── approvals.tsx    # Document approval workflow
│   │   ├── incidents.tsx    # Incidents workflow
│   │   ├── audit.tsx        # Audit logs
│   │   └── notifications.tsx
│   └── App.tsx              # Main app with routing
├── server/
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database operations
│   ├── seed.ts              # Database seeding
│   └── db.ts                # Database connection
└── shared/
    └── schema.ts            # Drizzle schema definitions
```

## Key Features

### Document Versioning
- Documents are never physically deleted
- Each update creates a new version
- Complete version history available
- Change reasons are mandatory

### Document Approval Workflow
- New document versions start with status "pending"
- Department admins can approve or reject pending versions
- Only approved versions are visible to regular users
- Document currentVersion only updates when a version is approved
- Rejection requires a reason
- All approval/rejection actions are logged in audit trail

### Audit Trail
- All actions are logged with user, timestamp, IP
- Logs are immutable
- Exportable to CSV
- Filterable by action type and entity

### Incidents & Approvals
- Four incident types: approval_request, document_observed, missing_info, sensitive_change
- Status workflow: pending → approved/rejected → closed
- Resolution comments are tracked

### Role System (Defined)
- Super Admin: Full system configuration
- Admin/Gerente: CRUD + approvals per department
- Auxiliar: CRUD without delete
- Viewer: Read-only access
- Auditor: Read-only + audit logs access

## API Endpoints

### Centers
- `GET /api/centers` - List all centers
- `GET /api/centers/:id` - Get single center
- `POST /api/centers` - Create center
- `PATCH /api/centers/:id` - Update center

### Documents
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Create document
- `GET /api/documents/:id/versions` - Get version history
- `POST /api/documents/:id/versions` - Create new version

### Document Approvals
- `GET /api/pending-approvals` - Get all pending document versions
- `POST /api/versions/:id/approve` - Approve a pending version
- `POST /api/versions/:id/reject` - Reject a pending version (with reason)

### Departments
- `GET /api/departments` - List all departments
- `POST /api/departments` - Create department

### Incidents
- `GET /api/incidents` - List all incidents
- `POST /api/incidents` - Create incident
- `PATCH /api/incidents/:id` - Update incident status

### Audit & Notifications
- `GET /api/audit-logs` - Get audit logs
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id` - Mark as read

## Database Schema

### Main Tables
- `users` - System users with roles
- `centers` - Buildings/centers across Mexico
- `departments` - Organizational departments
- `documents` - Document metadata
- `document_versions` - Version history
- `audit_logs` - Complete audit trail
- `incidents` - Incidents and approvals
- `notifications` - User notifications

## Future Enhancements
1. User authentication (Replit Auth recommended)
2. Role-based access control enforcement
3. File upload storage integration
4. Email notifications
5. Advanced reporting and analytics
6. Center-department associations

## Running the Application
The application runs on port 5000 with:
```bash
npm run dev
```

Database schema changes:
```bash
npm run db:push
```

## User Preferences
- Language: Spanish (es-MX)
- Date format: DD/MM/YYYY
- Theme: Light/Dark toggle available
