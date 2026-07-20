# Smart Wall Paint Visualizer (LuminaPaint Enterprise Edition)

[![CI/CD Pipeline](https://github.com/luminapaint/smart-wall-paint/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/luminapaint/smart-wall-paint/actions/workflows/ci-cd.yml)
[![Angular](https://img.shields.io/badge/Angular-20.0.0-DD0031.svg?logo=angular)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)](https://www.docker.com/)

LuminaPaint is an enterprise-grade web application designed for real-time interior wall color visualization, paint catalog management, and interactive room painting. Built on the modern MEAN stack (Angular 20, Node.js, Express, MongoDB Atlas, and Socket.IO), it features vector polygon wall masking, freehand brush tools, seamless texture blending, multi-user real-time collaboration, and an admin CMS.

---

## 🌟 Key Features

* **Interactive Room Canvas**: Freehand brush, polygon wall isolation, bucket fill, eraser, pan/zoom engine, and undo/redo stacks.
* **Paint Catalog & Texture Engine**: Browse curated paint swatches (Sherwin-Williams, Benjamin Moore) and apply realistic textures (Matte, Gloss, Venetian Plaster).
* **Real-time Collaboration**: Synchronized room editing sessions over Socket.IO websockets.
* **Admin CMS & Audit Logging**: User role management (User, Designer, Admin), audit logging, catalog administration, and business performance metrics.
* **Cloud Integration**: Cloudinary image upload processing pipeline and MongoDB Atlas cloud database synchronization.

---

## 📁 Workspace Folder Tree

```
project/
├── .github/workflows/ci-cd.yml # GitHub Actions CI/CD Pipeline
├── angular-client/             # Angular 20 Standalone Web Client
│   ├── src/app/
│   │   ├── features/           # Standalone views (Auth, Dashboard, Canvas, Admin)
│   │   ├── services/           # HTTP & Socket services
│   │   └── guards/             # Auth & Admin route guards
│   ├── Dockerfile              # Multi-stage Nginx client build
│   ├── nginx.conf              # SPA route fallback & reverse proxy
│   └── .env.example            # Client environment configuration
├── express-server/             # Express Node.js Backend API
│   ├── src/
│   │   ├── config/             # DB & Cloudinary configuration & seeding
│   │   ├── controllers/        # HTTP controllers
│   │   ├── middleware/         # Auth JWT, RBAC & Multer file upload
│   │   ├── models/             # Mongoose MongoDB schemas
│   │   ├── repositories/       # Data Access Object abstraction
│   │   ├── services/           # Business logic layer
│   │   └── sockets/            # Socket.IO websocket room synchronization
│   ├── Dockerfile              # Express production Dockerfile
│   └── .env.example            # Server environment configuration
├── docker-compose.yml          # Container orchestrator
├── postman_collection.json     # Postman API Test Suite (v2.1.0)
├── vercel.json                 # Vercel multi-project build manifest
├── phase2.md                   # Phase 2 Code Architecture & Workflows
└── phase3.md                   # Phase 3 Final QA & Deployment Specification
```

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` templates to `.env` files:

#### Backend Server Configuration (`express-server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://nandhini303303_db_user:<db_password>@cluster0.gpt9bjh.mongodb.net/smart-wall-paint?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_production_jwt_secret_key_2026
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
> **Note**: Replace `<db_password>` with the password for the `nandhini303303_db_user` MongoDB Atlas user.

#### Frontend Client Configuration (`angular-client/.env`)
```env
NG_APP_API_URL=http://localhost:5000/api
NG_APP_SOCKET_URL=http://localhost:5000
```

---

### 2. Database Seeding

Populate initial paint swatches (Sage Green, Terracotta) and wall textures (Venetian Plaster, Satin):
```bash
cd express-server
npm install
npm run seed
```

---

### 3. Local Development

#### Start Backend Server
```bash
cd express-server
npm run dev
```
Express API server will run at [http://localhost:5000/](http://localhost:5000/).

#### Start Angular Frontend
```bash
cd angular-client
npm install
npm start
```
Angular development client will open at [http://localhost:4200/](http://localhost:4200/).

---

## 🐳 Docker Deployment

To build and run the complete application stack (Client, Server, Reverse Proxy) with Docker Compose:
```bash
docker-compose up --build
```
The application portal will be accessible at [http://localhost/](http://localhost/).

---

## 🌐 Vercel Deployment

Deploy the application to Vercel using the included `vercel.json`:
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure `MONGODB_URI`, `JWT_SECRET`, and `CLOUDINARY_*` environment variables in Vercel.
4. Deploy!

---

## 🧪 Postman API Testing

Import `postman_collection.json` into Postman to test all endpoints:
* **Auth**: Register, Login, Get Profile.
* **Projects**: CRUD operations for visualizer projects & canvas layer configurations.
* **Catalog**: Query paint colors and wall textures.
* **Admin**: Manage user accounts, inspect audit logs, and view analytics.

---

## 🛡 Security & Performance

* **OWASP Top 10 Protected**: Bcrypt password hashing (12 rounds), JWT access token guards, rate limiting, and inputs sanitized via Mongoose queries.
* **Lighthouse Optimized**: Standalone Angular components, dynamic module lazy loading, offscreen canvas graphics rendering, and Nginx Brotli compression.

---

## 📄 License

This project is licensed under the MIT License.
