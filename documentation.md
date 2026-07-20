# SMART WALL PAINT VISUALIZER (LUMINAPAINT ENTERPRISE EDITION)
## MASTER TECHNICAL DOCUMENTATION & OPERATIONAL MANUAL

---

## 1. PROJECT OVERVIEW & OBJECTIVES

The **Smart Wall Paint Visualizer (LuminaPaint Enterprise Edition)** is a production-grade web application designed to allow users, interior designers, and paint retailers to visualize custom paint colors and wall textures on uploaded room photographs in real time.

### Key Objectives
* **Visual Precision**: Realistic wall color blending, opacity control, and seamless texture mapping.
* **Interactive Tooling**: Infinite canvas panning/zooming, freehand brush painting, vector polygon masking, bucket flood fill, grid alignment, and history undo/redo stacks.
* **Real-time Collaboration**: Multi-user concurrent editing of project canvases powered by Socket.IO WebSockets.
* **Enterprise CMS & Auditing**: Role-based access control (Admin, Designer, User), user permission administration, system security audit logging, and catalog management.

---

## 2. TECHNOLOGY STACK SUMMARY

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend Framework** | Angular 20 (Standalone Components, Signals State Management, RxJS) |
| **Canvas & Graphics** | Konva.js, HTML5 Canvas API |
| **Frontend Styling** | SCSS (Tailored HSL Design Tokens, Modern Obsidian Dark Mode) |
| **Backend Runtime** | Node.js (v20 LTS), Express.js (v4.x API Gateway) |
| **Database ODM** | MongoDB Atlas (Cloud Cluster), Mongoose (v8.x ODM) |
| **Real-time WebSockets**| Socket.IO (v4.x) |
| **Cloud File Storage** | Cloudinary SDK |
| **Containerization** | Docker, Docker Compose, Nginx (v1.25 Edge Proxy & SPA Static Host) |
| **Testing Suite** | Playwright E2E Testing Suite, Node.js Test Harness |
| **Deployment Targets** | Vercel Serverless Functions & Static Web Hosting |

---

## 3. COMPLETE WORKSPACE FOLDER STRUCTURE

```
project/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                   # GitHub Actions build, test & deploy workflow
├── angular-client/                     # Angular 20 Standalone Client Workspace
│   ├── .editorconfig
│   ├── .gitignore
│   ├── .prettierrc
│   ├── Dockerfile                      # Nginx multi-stage build container setup
│   ├── README.md
│   ├── angular.json                    # Workspace project configuration & build options
│   ├── nginx.conf                      # Edge SPA router fallback Nginx configuration
│   ├── package.json
│   ├── package-lock.json
│   ├── playwright.config.ts            # Playwright E2E browser test configuration
│   ├── tsconfig.app.json
│   ├── tsconfig.json                   # Path aliases (@core, @shared, @features, etc.)
│   ├── tsconfig.spec.json
│   ├── .env.example                    # Client environment template
│   ├── e2e/
│   │   └── app.spec.ts                 # Playwright E2E browser tests
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── index.html                  # HTML5 frame & Google Fonts loading
│       ├── main.ts                     # Application bootstrap script
│       ├── styles.scss                 # Master CSS Design Tokens & custom utility classes
│       └── app/
│           ├── app.component.ts        # Root app shell component
│           ├── app.config.ts           # Global application providers
│           ├── app.html
│           ├── app.routes.ts           # Standalone lazy-loaded route paths
│           ├── features/
│           │   ├── admin/              # Admin CMS, User Roles, Audit Logs & Analytics
│           │   │   ├── admin.component.html
│           │   │   ├── admin.component.scss
│           │   │   └── admin.component.ts
│           │   ├── auth/               # User Login & Registration views
│           │   │   ├── login.component.html
│           │   │   ├── login.component.scss
│           │   │   ├── login.component.ts
│           │   │   ├── register.component.html
│           │   │   ├── register.component.scss
│           │   │   └── register.component.ts
│           │   ├── canvas-editor/      # Interactive Room Visualizer Workspace
│           │   │   ├── canvas-editor.component.html
│           │   │   ├── canvas-editor.component.scss
│           │   │   └── canvas-editor.component.ts
│           │   └── dashboard/          # User Project Cards Gallery & Creation
│           │       ├── dashboard.component.html
│           │       ├── dashboard.component.scss
│           │       └── dashboard.component.ts
│           ├── guards/                 # Angular Route Guards
│           │   ├── admin.guard.ts
│           │   └── auth.guard.ts
│           └── services/               # State & HTTP Services
│               ├── admin.service.ts
│               ├── auth.service.ts
│               ├── catalog.service.ts
│               ├── project.service.ts
│               └── socket.service.ts
├── express-server/                     # Node.js & Express API Gateway
│   ├── Dockerfile                      # Production Node.js container setup
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── .env                            # Active runtime environment file
│   ├── .env.example                    # Backend environment template
│   └── src/
│       ├── index.ts                    # Application bootstrapper, websockets, routes
│       ├── config/
│       │   ├── cloudinary.ts           # Cloudinary SDK client configuration
│       │   ├── db.ts                   # Mongoose Atlas database connector
│       │   └── seed.ts                 # Database seeder (Colors, Textures)
│       ├── controllers/
│       │   ├── AdminController.ts
│       │   ├── AuthController.ts
│       │   ├── CatalogController.ts
│       │   └── ProjectController.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts       # JWT session validator guard
│       │   ├── errorMiddleware.ts      # Global centralized error handler
│       │   ├── multerMiddleware.ts     # Disk storage upload buffer
│       │   └── rbacMiddleware.ts       # Role-Based Access Control evaluator
│       ├── models/                     # Mongoose Models & Schemas
│       │   ├── AuditLog.ts
│       │   ├── Color.ts
│       │   ├── Project.ts
│       │   ├── Texture.ts
│       │   └── User.ts
│       ├── repositories/               # Data Access Object Layer
│       │   ├── AuditLogRepository.ts
│       │   ├── ColorRepository.ts
│       │   ├── ProjectRepository.ts
│       │   ├── TextureRepository.ts
│       │   └── UserRepository.ts
│       ├── routes/
│       │   ├── adminRoutes.ts
│       │   ├── authRoutes.ts
│       │   ├── catalogRoutes.ts
│       │   ├── index.ts
│       │   └── projectRoutes.ts
│       ├── services/                   # Business Logic Services
│       │   ├── AdminService.ts
│       │   ├── AuthService.ts
│       │   ├── CatalogService.ts
│       │   └── ProjectService.ts
│       └── sockets/
│           └── socketHandler.ts        # Real-time WebSocket room broadcast logic
├── .github/workflows/ci-cd.yml         # GitHub Actions pipeline
├── docker-compose.yml                  # Container stack orchestration
├── documentation.md                    # Single-file master documentation (This document)
├── Instruction1.md                     # Initial prompt requirements
├── landing_page_design.html            # Visual preview landing page
├── phase2.md                           # Phase 2 Code Architecture
├── phase3.md                           # Phase 3 Final QA & Deployment Architecture
├── phase4.md                           # Phase 4 Production Validation Report
├── phase5.md                           # Phase 5 Final Documentation Specification
├── postman_collection.json             # Postman Collection v2.1.0 test suite
├── README.md                           # Project summary documentation
└── vercel.json                         # Vercel deployment manifest
```

---

## 4. ARCHITECTURE MERMAID DIAGRAMS

### 4.1 System Request Flow Architecture
```mermaid
flowchart TD
    subgraph Client Layer (Angular 20)
        UI[User Component: CanvasEditorComponent / DashboardComponent] --> Store[Angular Signals State]
        Store --> Service[ProjectService / CatalogService / AuthService]
        Service --> HTTP[Angular HttpClient + Bearer Token]
    end

    subgraph Edge Proxy Layer
        HTTP -->|Port 80| Nginx[Nginx Reverse Proxy]
        Nginx -->|/api/* -> Port 5000| Express[Express API Gateway]
    end

    subgraph Backend Application Layer (Node.js/Express)
        Express --> Sec[Helmet & CORS Middleware]
        Sec --> Rate[Express Rate Limiter]
        Rate --> JWT[JWT authMiddleware]
        JWT --> RBAC[rbacMiddleware Guard]
        RBAC --> Routes[Express Router]
        Routes --> Controller[Controller Layer]
        Controller --> ServiceLayer[Service Business Logic]
        ServiceLayer --> Repo[Repository DAO Pattern]
        Repo --> Models[Mongoose Models]
    end

    subgraph Cloud Persistence Layer
        Models --> DB[(MongoDB Atlas Cloud Cluster)]
        ServiceLayer --> Cloudinary[Cloudinary CDN]
    end
```

### 4.2 Real-time Socket Collaboration Sequence
```mermaid
sequenceDiagram
    autonumber
    actor DesignerA as Designer A
    actor DesignerB as Designer B
    participant ClientA as Angular Client A
    participant SocketServer as Node.js Socket.IO Server
    participant ClientB as Angular Client B
    participant DB as MongoDB Atlas

    Note over DesignerA, ClientA: Joins Room Canvas #123
    ClientA->>SocketServer: emit("join-project", "123")
    Note over SocketServer: Joins Room "project:123"

    Note over DesignerB, ClientB: Joins Room Canvas #123
    ClientB->>SocketServer: emit("join-project", "123")
    Note over SocketServer: Joins Room "project:123"

    DesignerA->>ClientA: Draws Sage Green brush stroke
    Note over ClientA: Konva.js renders local vector stroke
    ClientA->>SocketServer: emit("draw-delta", { projectId: "123", delta })
    SocketServer-->>ClientB: broadcast("draw-delta-broadcast", delta)
    Note over ClientB: Konva.js applies stroke in real-time
    DesignerB-->>ClientB: Views stroke instantly

    ClientA->>DB: HTTP PUT /api/projects/123 (Autosave project state)
```

---

## 5. DATABASE ERD & MONGODB COLLECTIONS

```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ AUDIT_LOG : "triggers"
    PROJECT ||--o{ CANVAS_LAYER : "contains"
    COLOR ||--o{ CANVAS_LAYER : "applied to"
    TEXTURE ||--o{ CANVAS_LAYER : "applied to"

    USER {
        ObjectId _id PK
        string firstName
        string lastName
        string email UK
        string password UK "Bcrypt Hash (12 rounds)"
        string role "Admin | Designer | User"
        boolean isVerified
        datetime createdAt
    }

    PROJECT {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string originalImageUri "Cloudinary CDN / Local link"
        Array layers "JSON array of layer states"
        number zoomLevel
        datetime createdAt
        datetime updatedAt
    }

    COLOR {
        ObjectId _id PK
        string brandName "Sherwin-Williams | Benjamin Moore"
        string colorCode UK "e.g., SW-7006"
        string name "Sage Green"
        string hexCode "#8A9A86"
        number r
        number g
        number b
        boolean isActive
    }

    TEXTURE {
        ObjectId _id PK
        string name "Venetian Plaster"
        string imageUri "Tileable texture URL"
        number scaleDefault
        boolean isActive
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK
        string action "USER_LOGIN | PROJECT_EDIT | ROLE_CHANGE"
        string ipAddress
        string details
        datetime createdAt
    }
```

---

## 6. API SPECIFICATION & WEBSOCKET DICTIONARY

### 6.1 HTTP REST Endpoints

#### Authentication (`/api/auth`)
* `POST /api/auth/register` — Body: `{ firstName, lastName, email, password }`. Returns registered user document.
* `POST /api/auth/login` — Body: `{ email, password }`. Returns JWT Bearer token + user payload.
* `GET /api/auth/me` — Headers: `Authorization: Bearer <token>`. Returns current active user profile.

#### Project Management (`/api/projects`)
* `GET /api/projects` — Headers: `Authorization: Bearer <token>`. Returns array of projects owned by user.
* `POST /api/projects` — Form-Data: `name`, `image` (File). Uploads room photo to Cloudinary and saves project.
* `GET /api/projects/:id` — Returns single project model and layer details.
* `PUT /api/projects/:id` — Body: `{ layers, zoomLevel }`. Saves current layer configuration.
* `DELETE /api/projects/:id` — Soft deletes project document.

#### Paint & Texture Catalog (`/api/catalog`)
* `GET /api/catalog/colors` — Query Params: `brand`, `category`. Lists active paint catalog swatches.
* `POST /api/catalog/colors` — Body: `{ brandName, colorCode, name, hexCode, r, g, b }` (Admin only).
* `GET /api/catalog/textures` — Lists available seamless wall textures.
* `POST /api/catalog/textures` — Uploads seamless wall texture pattern image (Admin only).

#### System Administration (`/api/admin`)
* `GET /api/admin/users` — Returns user accounts registry (Admin only).
* `PUT /api/admin/users/:id/role` — Body: `{ role: "Designer" | "Admin" | "User" }`.
* `GET /api/admin/audit-logs` — Fetches security audit log records.
* `GET /api/admin/analytics` — Generates total users, projects, and top paint color analytics.

### 6.2 WebSockets Dictionary (Socket.IO)

* `join-project` (`projectId: string`): Joins a Socket.IO room named `project:<projectId>`.
* `leave-project` (`projectId: string`): Leaves the active room.
* `draw-delta` (`{ projectId, delta }`): Emits local brush strokes or shapes to the server.
* `draw-delta-broadcast` (`delta`): Broadcasts drawing events to all other connected clients in the room.
* `layer-update` (`{ projectId, layerId, layers }`): Broadcasts layer stack modifications.

---

## 7. CANVAS ENGINE & COMPONENT DOCUMENTATION

### 7.1 Canvas Core Capabilities ([canvas-editor.component.ts](file:///c:/Users/Rishi/OneDrive/Pictures/project/angular-client/src/app/features/canvas-editor/canvas-editor.component.ts))
* **Konva.js Layer Stack**: Base Image Layer, Paint Layer, Grid Overlay Layer, and Interactive Overlay Layer.
* **Infinite Pan & Zoom**: Mouse wheel zoom calculation centered at cursor coordinates (`scaleBy: 1.05`, boundaries `0.5x` to `8.0x`).
* **Freehand Brush**: Smooth stroke rendering with configurable brush size slider (2px to 100px) and opacity (10% to 100%).
* **Polygon Masking**: Multi-point vector anchor placement, dash preview lines, path closing, and solid color fill.
* **Bucket Fill**: Instant wall segment highlight fill with tolerance settings.
* **Undo & Redo Stacks**: Dual array history stacks (`historyStack` & `redoStack`) preserving canvas node object serializations.
* **Grid Overlay**: 40px grid line rendering for precise architectural snapping.
* **High-Res Export & Sharing**: PNG export (`stage.toDataURL()`), JSON project backup, and shareable URL modal.

---

## 8. AUTHENTICATION, SECURITY & RBAC

* **Password Security**: Passwords hashed using `bcrypt` (12 salt rounds).
* **JWT Access Control**: Tokens signed with `JWT_SECRET` and validated per request via `authMiddleware.ts`.
* **Role-Based Access Control (RBAC)**: Enforced by `rbacMiddleware.ts`:
  * `User`: Standard project creation and editing.
  * `Designer`: Advanced layer stack and texture mapping features.
  * `Admin`: Full CMS access (User role modification, catalog color/texture additions, audit log inspection).
* **Injection & Rate Protection**: Parameterized Mongoose queries prevent NoSQL injection; `express-rate-limit` enforces 100 requests per 15 minutes per IP.

---

## 9. ENVIRONMENT VARIABLES & IMPORT ALIASES

### 9.1 Backend Environment Variables (`express-server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://nandhini303303_db_user:<db_password>@cluster0.gpt9bjh.mongodb.net/smart-wall-paint?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=smart_wall_paint_visualizer_enterprise_secret_2026
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 9.2 Frontend Import Aliases (`angular-client/tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/@core/*"],
      "@shared/*": ["src/app/@shared/*"],
      "@features/*": ["src/app/features/*"],
      "@canvas/*": ["src/app/features/canvas-editor/*"],
      "@config/*": ["src/app/@config/*"]
    }
  }
}
```

---

## 10. DOCKER, NGINX, VERCEL & CI/CD INFRASTRUCTURE

### 10.1 Docker Compose setup (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  api-server:
    build:
      context: ./express-server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    restart: always

  web-client:
    build:
      context: ./angular-client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api-server
    restart: always
```

### 10.2 Nginx Reverse Proxy (`angular-client/nginx.conf`)
Proxies `/api/` and `/socket.io/` requests to `http://api-server:5000` while supporting HTML5 SPA client routing.

---

## 11. STEP-BY-STEP EXECUTION & OPERATIONAL GUIDE

Follow these exact steps to set up, run, seed, test, and deploy the application:

### Step 1: Clone the Code Repository
```bash
git clone https://github.com/luminapaint/smart-wall-paint.git
cd smart-wall-paint
```

### Step 2: Install Backend Dependencies
```bash
cd express-server
cmd /c npm install
```
*Expected Output*: `added 245 packages in 8s`

### Step 3: Configure Backend `.env` File
Create `express-server/.env` with your credentials:
```env
PORT=5000
MONGODB_URI=mongodb+srv://nandhini303303_db_user:YourPasswordHere@cluster0.gpt9bjh.mongodb.net/smart-wall-paint?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=smart_wall_paint_visualizer_enterprise_secret_2026
CLOUDINARY_CLOUD_NAME=dummy_cloud
CLOUDINARY_API_KEY=dummy_key
CLOUDINARY_API_SECRET=dummy_secret
```

### Step 4: Install Frontend Dependencies
```bash
cd ../angular-client
cmd /c npm install
```
*Expected Output*: `added 812 packages in 14s`

### Step 5: Seed the Database
Populate paint catalog swatches (Sage Green, Terracotta) and wall textures:
```bash
cd ../express-server
cmd /c npm run seed
```
*Expected Output*:
```
[Database] Connected to MongoDB Atlas Cloud Cluster.
[Seed] Paint colors catalog seeded successfully.
[Seed] Wall textures library seeded successfully.
```

### Step 6: Launch Backend Express Server
```bash
cmd /c npm run dev
```
*Expected Output*:
```
[Server] Express API Gateway running on port 5000
[Socket.IO] WebSocket server bound and ready for client connections
```

### Step 7: Launch Frontend Angular Client
In a second terminal window:
```bash
cd angular-client
cmd /c npm start
```
*Expected Output*:
```
Initial chunk files | Names | Raw size
main.js            | main  | 280.10 kB
Application bundle generation complete. Application running at http://localhost:4200/
```

### Step 8: Build Production Backend
```bash
cd express-server
cmd /c npm run build
```
*Expected Output*: `tsc completed with 0 errors`

### Step 9: Build Production Frontend
```bash
cd angular-client
cmd /c npm run build
```
*Expected Output*:
```
Application bundle generation complete. [7.340 seconds]
Output location: dist/angular-client
0 errors, 0 warnings
```

### Step 10: Launch Docker Container Stack
```bash
cd ..
docker-compose up --build
```
*Expected Output*: `web-client listening on port 80`

### Step 11: Execute Playwright E2E Tests
```bash
cd angular-client
npx playwright test
```
*Expected Output*: `3 passed (4.2s)`

### Step 12: Deploy to Vercel
```bash
vercel --prod
```

---

## 12. TROUBLESHOOTING & FAQ

### Q1: MongoDB Atlas Connection Errors
* **Cause**: IP restriction on Atlas cluster.
* **Fix**: Navigate to MongoDB Atlas Dashboard $\rightarrow$ Network Access $\rightarrow$ Add IP Address `0.0.0.0/0` for development.

### Q2: Angular SCSS Budget Warnings
* **Fix**: Ensured `maximumWarning: 8kB` is configured in `angular.json` under `anyComponentStyle`.

---

## 13. FUTURE ROADMAP (V2.0)

- [ ] AI Automatic Wall Boundary Detection using Computer Vision.
- [ ] 3D Depth-Map Mesh Texture Blending.
- [ ] Native Mobile App (iOS / Android) using ARKit / ARCore.

---

## 14. LICENSE

This project is licensed under the MIT License — see the LICENSE file for full details.
