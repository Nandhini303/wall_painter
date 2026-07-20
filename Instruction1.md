# MASTER PROMPT — Smart Wall Paint Visualizer (Enterprise Edition)

Act as a **Principal Product Architect, UI/UX Lead, Solution Architect, Senior MEAN Stack Engineer, DevOps Engineer, Database Architect, and Technical Lead**.

## Objective

Build a **100% production-ready Smart Wall Paint Visualizer** from planning to deployment.

Work in **3 phases**.

---

# PHASE 1 — PRODUCT & SYSTEM DESIGN (NO CODE)

Do **NOT** generate source code.

Analyze the PRD and design the complete enterprise application.
all ui design using littele bite stich ai mcp call 
## Deliver

### Product

* PRD Analysis
* Business Goals
* User Stories
* Functional & Non-functional Requirements
* MVP vs Future Roadmap

### UX

* User Journey
* Admin Journey
* Information Architecture
* Sitemap
* Navigation Flow
* Feature Map
* Screen Flow
* Wireframes
* Responsive Design
* Design Tokens
* Color System
* Typography
* Icon System
* Component Library

### Screens

Design every page.

Authentication

* Landing
* Login
* Register
* Verify Email
* Forgot Password
* Reset Password

Application

* Dashboard
* Projects
* Create Project
* Project Details
* Upload Image
* Canvas Editor
* Wall Selection
* Layers
* Properties
* Colors
* Textures
* Compare
* History
* Export
* Share
* Profile
* Notifications
* Settings
* Help
* FAQ

Administration

* Dashboard
* Users
* Roles
* Permissions
* Projects
* Colors
* Textures
* Analytics
* Audit Logs
* System Settings

System

* 404
* 500
* Maintenance
* Unauthorized

### Canvas Architecture

Design

* Infinite Canvas
* Grid
* Snap Grid
* Rulers
* Guides
* Layers
* Brush
* Bucket
* Polygon
* Eraser
* Selection
* Zoom
* Pan
* Rotate
* Measurements
* Alignment
* History
* Undo
* Redo
* Keyboard Shortcuts
* Export

### Backend Design

* Database ERD
* MongoDB Collections
* Relationships
* API Specification
* Authentication
* RBAC
* Validation
* Security
* Caching
* Logging
* Image Pipeline

### Architecture

* Clean Architecture
* SOLID
* Repository Pattern
* Feature First
* Folder Structure
* Import Alias Strategy

```
@core
@shared
@features
@canvas
@admin
@layout
@services
@models
@utils
@store
@guards
@interceptors
@pipes
@directives
@constants
@config
@assets
```

### Deployment

* Docker
* Nginx
* Vercel
* MongoDB Atlas
* Cloudinary
* CI/CD

### Performance

* Lazy Loading
* Image Optimization
* Code Splitting
* Bundle Optimization
* Caching

### Deliverables

Complete architecture before writing code.

---

# PHASE 2 — FULL SOURCE CODE

After Phase 1 approval generate FULL production code.

Never skip files.

Never use placeholders.

Generate complete implementations.

Follow dependency order.

## Tech Stack

Frontend

* Angular 20
* TypeScript
* SCSS
* Angular Material
* Konva/Fabric.js
* RxJS
* Signals

Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* JWT
* RBAC
* Socket.IO
* Cloudinary

Deployment

* Docker
* Nginx
* Vercel

## Build Order

1 Folder Tree

2 Angular Workspace

3 Backend Workspace

4 Config

5 Environment

6 Shared Types

7 Database

8 Models

9 Repository

10 Services

11 Controllers

12 Middleware

13 Routes

14 Authentication

15 Authorization

16 APIs

17 Socket.IO

18 Shared Components

19 Layout

20 Dashboard

21 Projects

22 Canvas

23 Upload

24 Wall Selection

25 Layers

26 Properties

27 Colors

28 Textures

29 Compare

30 Export

31 Share

32 Profile

33 Notifications

34 Settings

35 Help

36 Admin

37 Analytics

38 Audit Logs

39 Error Pages

40 Tests

41 Docker

42 README

43 Postman

44 Seed Data

45 Deployment

### Features

Authentication

Profile CRUD

Projects CRUD

Canvas

Real-time MongoDB

Paint Colors

Textures

Undo/Redo

History

Export PNG JPG SVG PDF JSON

Search

Filter

Pagination

Comments

Favorites

Notifications

Analytics

Activity Logs

Theme Builder

Dark Mode

Accessibility

Responsive

Inline Editing

Copy Buttons

Skeleton Loading

Toasts

Role Permissions

Admin CMS

---

# PHASE 3 — FINAL QA & DEPLOYMENT

Generate

* Folder Tree
* File List
* Routes
* APIs
* MongoDB Collections
* ERD
* README
* Docker
* docker-compose
* Nginx
* .env.example
* Seed Database
* Postman Collection
* Deployment Guide
* Production Checklist
* Security Audit
* Performance Audit
* Lighthouse Optimization
* Vercel Deployment
* MongoDB Atlas Configuration
* Cloudinary Configuration
* CI/CD Guide

---

## Database

Use MongoDB Atlas.

Store credentials only in environment variables.

Never hardcode secrets.

Use indexes, validation, transactions, and optimized schemas.

Implement real-time synchronization using Socket.IO.

---

## Output Rules

* Generate full source code only.
* Never omit files.
* Never shorten implementations.
* Never output placeholders.
* Continue automatically until the application is 100% complete and production-ready.
* Ensure the project builds successfully and is ready for deployment on Vercel with MongoDB Atlas.

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://nandhini303303_db_user:<db_password>@cluster0.gpt9bjh.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
Replace <db_password> with the password for the nandhini303303_db_user database user. Ensure any option params are URL encoded.