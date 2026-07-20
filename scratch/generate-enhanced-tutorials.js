const fs = require('fs');
const path = require('path');

const tutDir = path.join(__dirname, '..', 'tutorials');
if (!fs.existsSync(tutDir)) fs.mkdirSync(tutDir);

const tut1 = `
# 🎨 Tutorial 1: Project Setup & Architecture

📘 **What you'll learn:**
- How this monorepo is structured (Angular 17 + Express)
- How to run both servers locally
- Angular 17 Signals & Standalone components in action
- The Express API bootstrap flow

**Prerequisites:** Basic knowledge of TypeScript and web development.

> **📖 New terms in this chapter:**
> - **Monorepo:** A single repository containing multiple distinct projects (here, frontend and backend).
> - **Signals:** A new Angular feature for managing state reactively without complex RxJS observables.
> - **Standalone Components:** Angular components that don't need a bulky \`NgModule\` to work.

---

## 📘 Learn: System Architecture

Before we code, let's visualize how the entire Smart Wall Painter app connects:

\`\`\`mermaid
graph LR
    A[Angular 17 Client] <-->|Socket.IO / HTTP| B(Express Server)
    B <-->|Mongoose| C[(MongoDB Atlas)]
    B <-->|Multer| D[Cloudinary]
    A -->|Uploads| D
\`\`\`

---

## 🛠️ Build: Running Locally

Follow these step-by-step instructions to get the app running on your machine.

**Step 1. Configure the Backend**
Open the \`express-server/\` directory and create a \`.env\` file.
\`\`\`text
// file: express-server/.env
PORT=5000
MONGODB_URI=your_mongo_url
JWT_SECRET=supersecret
CLOUDINARY_URL=your_cloudinary_url
\`\`\`
![step-1](https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop)

**Step 2. Start the Backend Server**
Run the following in your terminal:
\`\`\`bash
cd express-server
npm install
npm run dev
\`\`\`

**Step 3. Start the Frontend Client**
Open a new terminal tab and start Angular:
\`\`\`bash
cd angular-client
npm install
npm start
\`\`\`
![step-3](./images/01-step-3.png)

---

## 📘 Learn: The Code Setup

### Angular 17 Signals
In this app, we use Signals to manage state cleanly. Look at the canvas editor:

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
export class CanvasEditorComponent {
  activeTool = signal<'select' | 'pan' | 'draw' | 'wall' | 'erase'>('select');
  canUndo = signal(false);
}
\`\`\`

### Express Bootstrap
Our backend is initialized cleanly with Express and Socket.IO working together on the same port:

\`\`\`typescript
// file: express-server/src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
\`\`\`

---

## 🧪 Practice: Build It Yourself

**Goal:** Add a new Express route and call it from Angular.

1. Create a \`/api/health\` route in Express that returns \`{ status: "ok" }\`.
2. Create an Angular service that fetches this route on load.
3. Display the status on the dashboard!

**✅ Check yourself:**
- [ ] Did you restart the Express server after adding the route?
- [ ] Does navigating to \`http://localhost:5000/api/health\` work in your browser?
- [ ] Does the Angular UI update when the request finishes?
`;

const tut2 = `
# 🎨 Tutorial 2: Canvas Engine (Konva.js)

📘 **What you'll learn:**
- Setting up the Konva Stage and Layers
- Building drawing tools and polygons
- Handling Undo/Redo logic natively

**Prerequisites:** [Tutorial 1: Project Setup & Architecture](./01-fundamentals.md)

> **📖 New terms in this chapter:**
> - **Konva.js:** An HTML5 2D canvas library that provides desktop-app-like interactivity (drag/drop, grouping).
> - **Stage/Layer:** Konva's hierarchy. The Stage holds Layers, and Layers hold Shapes.
> - **Imperative API:** Writing code that explicitly dictates *how* to do things step-by-step (unlike Angular templates which are declarative).

---

## 📘 Learn: Canvas Hierarchy

\`\`\`mermaid
graph TD
    A[Konva Stage] --> B[Background Layer]
    A --> C[Paint Layer]
    A --> D[Polygon Anchors Layer]
    C --> E(Image)
    C --> F(Polygon Line)
    D --> G(Draggable Anchor Circle)
\`\`\`

---

## 🛠️ Build: Drawing a Polygon

**Step 1. Initialize the Stage**
Open the canvas editor and bind Konva to an HTML \`<div>\`.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
initStage() {
  const container = this.canvasContainer.nativeElement;
  this.stage = new Konva.Stage({
    container: container,
    width: container.offsetWidth,
    height: container.offsetHeight,
  });
  this.paintLayer = new Konva.Layer();
  this.stage.add(this.paintLayer);
}
\`\`\`
![step-1](./images/02-step-1.png)

**Step 2. Render Draggable Anchors**
To allow vertex editing, we render tiny blue circles on every polygon point.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
renderPolygonAnchors(polygon: Konva.Line) {
  const points = polygon.points();
  for (let i = 0; i < points.length; i += 2) {
    const anchor = new Konva.Circle({
      x: points[i],
      y: points[i + 1],
      radius: 6,
      fill: '#3b82f6',
      draggable: true,
    });
    this.polygonAnchorsLayer.add(anchor);
  }
}
\`\`\`

**Step 3. Implement Undo/Redo**
By tracking the last drawn shape, we can seamlessly pop it off the layer.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
undo(): void {
  const children = this.paintLayer.getChildren();
  const lastStroke = children[children.length - 1];
  if (lastStroke) {
    this.redoStack.push(lastStroke);
    lastStroke.remove();
    this.paintLayer.batchDraw();
  }
}
\`\`\`
![step-3](https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop)

---

## 🧪 Practice: Build It Yourself

**Goal:** Add a new Konva shape tool (e.g., an Ellipse) to the toolbar.

1. Add \`'ellipse'\` to the \`activeTool\` Signal.
2. Add a new button in the HTML template to select this tool.
3. In the \`mousedown\` listener on the stage, if the tool is \`ellipse\`, create a new \`Konva.Ellipse\`.

**✅ Check yourself:**
- [ ] Can you select the new tool?
- [ ] Does dragging the mouse create an ellipse of varying size?
- [ ] Does the Undo button successfully remove the newly drawn ellipse?
`;

const tut3 = `
# 🎨 Tutorial 3: Realtime Collaboration (Socket.IO)

📘 **What you'll learn:**
- Emitting and listening to events in Angular
- Syncing live drawing data across multiple clients

**Prerequisites:** [Tutorial 2: Canvas Engine (Konva.js)](./02-canvas-engine.md)

> **📖 New terms in this chapter:**
> - **Socket.IO:** A library that enables persistent, bi-directional communication between a web client and server (using WebSockets).
> - **Emit:** Sending an event/data message through the socket.
> - **Broadcast:** Sending a message to everyone *except* the sender.

---

## 📘 Learn: Event Sequence

When one user draws, everyone else sees it instantly without refreshing.

\`\`\`mermaid
sequenceDiagram
    participant User A
    participant Server
    participant User B
    
    User A->>Server: emit('layer-update', canvasData)
    Server-->>User B: emit('layer-update-broadcast', canvasData)
    Note over User B: Updates Konva Layer
\`\`\`

---

## 🛠️ Build: Real-time Architecture

**Step 1. Server Event Handlers**
The backend needs to receive data from one client and bounce it to others in the same room.

\`\`\`typescript
// file: express-server/src/sockets/socketHandler.ts
export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('join-project', (projectId) => {
      socket.join(projectId);
    });

    socket.on('layer-update', (data) => {
      // Broadcast to everyone else in the room!
      socket.to(data.projectId).emit('layer-update-broadcast', data);
    });
  });
};
\`\`\`
![step-1](./images/03-step-1.png)

**Step 2. Client Socket Service**
In Angular, we centralize this logic into a reusable service.

\`\`\`typescript
// file: angular-client/src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io('https://wall-painter.onrender.com');

  joinProjectRoom(projectId: string): void {
    this.socket.emit('join-project', projectId);
  }

  on(eventName: string, callback: any): void {
    this.socket.on(eventName, callback);
  }
}
\`\`\`

**Step 3. Receiving Data in the Canvas**
When the canvas receives an update, it must redraw itself.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
ngOnInit() {
  this.socketService.on('layer-update-broadcast', (data) => {
    // Prevent infinite loop by flagging this as a remote update!
    this.isRemoteUpdate = true; 
    this.loadCanvasData(data.layers);
  });
}
\`\`\`
![step-3](https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop)

---

## 🧪 Practice: Build It Yourself

**Goal:** Broadcast a new custom Socket.IO event (e.g., user typing indicator or live cursors).

1. Listen to the Konva stage \`mousemove\` event.
2. Throttle the event (so you don't spam the server) and emit the X/Y coordinates.
3. Have other clients listen for these coordinates and render a tiny colored circle at that spot.

**✅ Check yourself:**
- [ ] Did you remember to throttle the \`mousemove\` event?
- [ ] Are coordinates being broadcasted successfully to the server?
- [ ] Do you see the other user's cursor moving on your screen?
`;

const tut4 = `
# 🎨 Tutorial 4: Backend Data & Auth

📘 **What you'll learn:**
- MongoDB schema design with Mongoose
- JSON Web Token (JWT) Authentication
- Cloudinary Integration for Assets

**Prerequisites:** [Tutorial 3: Realtime Collaboration (Socket.IO)](./03-realtime-collaboration.md)

> **📖 New terms in this chapter:**
> - **JWT (JSON Web Token):** A secure, encrypted string that identifies a logged-in user without needing server sessions.
> - **Mongoose:** An ODM (Object Data Modeling) library for MongoDB that enforces strict schemas.
> - **Cloudinary:** A cloud platform that acts as a CDN for our uploaded image assets.

---

## 📘 Learn: Request & Auth Flow

\`\`\`mermaid
graph TD
    A[Client UI] -->|1. POST /login| B[Express Auth Controller]
    B -->|2. Check Hash| C[(MongoDB Users)]
    B -->|3. Return JWT| A
    A -->|4. Bearer Token Header| D[Protected Routes]
    D -->|5. Verify Token| E[Access Granted]
\`\`\`

---

## 🛠️ Build: Schemas and Auth

**Step 1. Defining a Mongoose Schema**
We define what a Project should look like in the database.

\`\`\`typescript
// file: express-server/src/models/Project.ts
import mongoose, { Schema } from 'mongoose';

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  canvasState: { type: String, default: '[]' }
}, { timestamps: true });

export const Project = mongoose.model('Project', ProjectSchema);
\`\`\`

**Step 2. Creating the Auth Middleware**
This protects our routes by enforcing JWT checks.

\`\`\`typescript
// file: express-server/src/middleware/authMiddleware.ts
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
\`\`\`
![step-2](./images/04-step-2.png)

**Step 3. Cloudinary Upload Route**
We proxy asset uploads directly to Cloudinary using \`multer\`.

\`\`\`typescript
// file: express-server/src/routes/upload.routes.ts
import { upload } from '../config/cloudinary';

router.post('/upload', protect, upload.single('file'), (req, res) => {
  res.status(201).json({
    url: req.file.path,
    publicId: req.file.filename
  });
});
\`\`\`
![step-3](https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop)

---

## 🧪 Practice: Build It Yourself

**Goal:** Add a new protected MongoDB collection + CRUD route with a JWT check.

1. Create a \`Comment\` schema (text, author, projectId).
2. Build an Express router for \`GET /api/comments\` and \`POST /api/comments\`.
3. Protect the \`POST\` route with the \`protect\` middleware.

**✅ Check yourself:**
- [ ] Does sending a POST request without a token fail with a 401 error?
- [ ] Does sending it *with* a valid token correctly save to the database?
- [ ] Can you fetch the comments via the GET route?
`;

const tut5 = `
# 🎨 Tutorial 5: Advanced & Production Considerations

📘 **What you'll learn:**
- Deploying frontend to Vercel
- Deploying backend to Render
- Environment variable management

**Prerequisites:** [Tutorial 4: Backend Data & Auth](./04-backend-data-auth.md)

> **📖 New terms in this chapter:**
> - **Vercel:** A modern hosting platform optimized for frontend frameworks (like Angular).
> - **Render:** A cloud provider optimized for running backend services (like Node.js servers) via Docker or native runtimes.
> - **SPA (Single Page Application):** Web apps that dynamically rewrite the current page rather than loading new pages from a server.

---

## 📘 Learn: Production Architecture

\`\`\`mermaid
graph LR
    A[Browser] -->|HTTPS| B[Vercel Edge Network]
    B -->|Serves Angular| A
    A -->|API Calls / WSS| C[Render Node.js Instance]
    C -->|Secure Connection| D[(MongoDB Atlas)]
\`\`\`

---

## 🛠️ Build: Deployment Configs

**Step 1. Vercel SPA Routing**
Because Angular is an SPA, if a user refreshes the page on \`/dashboard\`, Vercel will throw a 404. We fix this by rewriting all requests to \`index.html\`.

\`\`\`json
// file: angular-client/vercel.json
{
  "outputDirectory": "dist/angular-client/browser",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
\`\`\`
![step-1](./images/05-step-1.png)

**Step 2. Render Build Command**
Render builds Node apps automatically, but it defaults to a production environment that strips out TypeScript compiler dependencies. We force it to keep them!

In your Render dashboard settings:
\`\`\`bash
# Build Command
npm install --legacy-peer-deps && npm run build

# Start Command
npm start
\`\`\`

**Step 3. Environment Variable Routing**
Your frontend needs to know to talk to Render, not localhost.

\`\`\`typescript
// file: angular-client/src/app/services/socket.service.ts
import { isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private serverUrl = isDevMode() 
    ? 'http://localhost:5000' 
    : 'https://wall-painter.onrender.com';
    
  // ...
}
\`\`\`
![step-3](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop)

---

## 🧪 Practice: Build It Yourself

**Goal:** Deploy your fork to Vercel + Render and verify env vars work.

1. Connect your GitHub repo to Render and deploy the Express app.
2. Connect your GitHub repo to Vercel and deploy the Angular app.
3. Test a full round-trip drawing operation on the live URLs.

**✅ Check yourself:**
- [ ] Does the Vercel site load without 404 errors?
- [ ] Does drawing on the Vercel site emit socket events to the Render backend?
- [ ] Can a friend on a different computer see your drawings in real-time?
`;

const tut6 = `
# 🎨 Tutorial 6: Capstone Project

📘 **What you'll learn:**
- Combining everything from Chapters 1-5 into a single massive feature.
- End-to-end full-stack development workflow.

**Prerequisites:** Complete Tutorials 1 through 5.

> **📖 New terms in this chapter:**
> - **End-to-End (E2E):** Building a feature that touches the database, backend routes, frontend UI, and real-time syncing.

---

## 📘 Learn: The Capstone Goal

We are going to build a **Layers Panel with Realtime Sync**. This allows users to see exactly which objects are on the canvas, rename them, and reorder them (like Photoshop!).

\`\`\`mermaid
sequenceDiagram
    participant User A
    participant Angular UI
    participant Server
    
    User A->>Angular UI: Rename Layer to "Red Wall"
    Angular UI->>Server: Emit 'layer-renamed'
    Server->>Database: Save new layer name
    Server-->>Other Users: Broadcast 'layer-renamed-broadcast'
\`\`\`

---

## 🛠️ Build: The Capstone

**Step 1. Database Update**
We need to ensure the MongoDB \`Project\` schema supports robust layer names. (It currently just saves a raw JSON string of Konva data).

\`\`\`typescript
// file: express-server/src/models/Project.ts
// Add a new field to track layer metadata if necessary!
\`\`\`

**Step 2. The Angular UI Component**
Create a new standalone component that loops through the Konva nodes and displays them in a list.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/components/layers-panel/layers-panel.component.ts
@Component({
  selector: 'app-layers-panel',
  standalone: true,
  template: \`
    <div class="layers-panel">
      @for (layer of canvasLayers(); track layer._id) {
        <div class="layer-item">{{ layer.name() }}</div>
      }
    </div>
  \`
})
export class LayersPanelComponent {
  canvasLayers = signal<Konva.Node[]>([]);
}
\`\`\`
![step-2](./images/06-step-2.png)

**Step 3. Wiring up the Socket**
When a user drags a layer up or down in the panel, emit the event!

\`\`\`typescript
// file: angular-client/src/app/services/socket.service.ts
emitLayerReorder(projectId: string, newOrder: any[]) {
  this.socket.emit('layer-reorder', { projectId, newOrder });
}
\`\`\`
![step-3](https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop)

---

## 🧪 Practice: Build It Yourself

**Goal:** Finish the Capstone Project on your own!

1. Implement drag-and-drop reordering in the Angular template.
2. Hook up the backend to save the new order.
3. Deploy the final capstone to Vercel/Render!

**✅ Check yourself:**
- [ ] Can you drag a layer up and see it jump to the front of the canvas?
- [ ] Do other connected users see the reorder instantly?
- [ ] Are the names saved to MongoDB successfully?

### 🚀 What's Next?
Congratulations! You've mastered full-stack architectural design. Consider adding these features next:
- Role-based permissions (Viewer vs Editor).
- PDF / Image exporting pipeline.
- AI-based texture generation!
`;

fs.writeFileSync(path.join(tutDir, '01-fundamentals.md'), tut1.trim());
fs.writeFileSync(path.join(tutDir, '02-canvas-engine.md'), tut2.trim());
fs.writeFileSync(path.join(tutDir, '03-realtime-collaboration.md'), tut3.trim());
fs.writeFileSync(path.join(tutDir, '04-backend-data-auth.md'), tut4.trim());
fs.writeFileSync(path.join(tutDir, '05-advanced-production.md'), tut5.trim());
fs.writeFileSync(path.join(tutDir, '06-capstone-project.md'), tut6.trim());

console.log("Enhanced tutorials successfully generated!");
