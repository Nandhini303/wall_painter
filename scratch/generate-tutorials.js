const fs = require('fs');
const path = require('path');

const tutorialsDir = path.join(__dirname, '..', 'tutorials');
if (!fs.existsSync(tutorialsDir)) {
  fs.mkdirSync(tutorialsDir);
}

const tut1 = `
# Tutorial 1: Project Setup & Architecture

### What you'll learn:
- How this monorepo is structured (Angular 17 + Express)
- How to run both servers locally
- Angular 17 Signals & Standalone components in action
- The Express API bootstrap flow

**Prerequisites:** Basic knowledge of TypeScript and web development.

---

## 1. Repository Structure
This project is divided into two main folders:
- \`angular-client/\`: The frontend Angular 17 application using standalone components and Signals.
- \`express-server/\`: The Node.js Express backend using Socket.IO and MongoDB.

## 2. Running Locally

Before running, ensure you have a \`.env\` file in \`express-server/\` with your MongoDB URI, JWT Secret, and Cloudinary keys.

Start the backend:
\`\`\`bash
cd express-server
npm install
npm run dev
\`\`\`

Start the frontend:
\`\`\`bash
cd angular-client
npm install
npm start
\`\`\`

## 3. Angular 17 Standalone & Signals
In this repo, we use the latest Angular features. Instead of \`NgModules\`, components like the Canvas Editor pull in exactly what they need.

Notice how we use **Signals** in \`canvas-editor.component.ts\`:
\`\`\`typescript
// src/app/features/canvas-editor/canvas-editor.component.ts
export class CanvasEditorComponent implements OnInit, OnDestroy {
  activeTool = signal<'select' | 'pan' | 'draw' | 'wall' | 'erase'>('select');
  canUndo = signal(false);
  canRedo = signal(false);
  
  // ...
\`\`\`
Signals provide a simpler, more reactive way to manage state without complex RxJS observables!

## 4. Express Bootstrap
Our API is bootstrapped in \`express-server/src/index.ts\`. Here's a snippet showing how we combine Express, Rate Limiting, and Socket.IO:

\`\`\`typescript
// src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Setup Socket.IO
setupSocketHandlers(io);
\`\`\`

---

### Try it yourself!
*Exercise:* Create a new Signal in \`canvas-editor.component.ts\` called \`backgroundColor\` and bind it to the stage background!
`;

const tut2 = `
# Tutorial 2: Canvas Engine (Konva.js)

### What you'll learn:
- Setting up the Konva Stage and Layers
- Building drawing tools and polygons
- Handling Undo/Redo logic natively

**Prerequisites:** [Tutorial 1: Project Setup & Architecture](./01-fundamentals.md)

---

## 1. Setting up Konva.js
In \`canvas-editor.component.ts\`, the canvas is initialized directly into an HTML container.

\`\`\`typescript
// src/app/features/canvas-editor/canvas-editor.component.ts
initStage() {
  const container = this.canvasContainer.nativeElement;
  this.stage = new Konva.Stage({
    container: container,
    width: container.offsetWidth,
    height: container.offsetHeight,
  });

  this.bgLayer = new Konva.Layer();
  this.paintLayer = new Konva.Layer();
  
  this.stage.add(this.bgLayer);
  this.stage.add(this.paintLayer);
}
\`\`\`

## 2. Drawing Polygons & Vertices
For architectural walls, we use \`Konva.Line\` to create closed polygons. We also dynamically render anchor points so users can edit the vertices!

\`\`\`typescript
// src/app/features/canvas-editor/canvas-editor.component.ts
renderPolygonAnchors(polygon: Konva.Line) {
  this.clearPolygonAnchors();
  const points = polygon.points();
  
  for (let i = 0; i < points.length; i += 2) {
    const anchor = new Konva.Circle({
      x: points[i],
      y: points[i + 1],
      radius: 6,
      fill: '#3b82f6',
      draggable: true,
    });
    // ...
\`\`\`

## 3. Undo & Redo System
We manage state history efficiently by maintaining an array of Konva node states.

\`\`\`typescript
// src/app/features/canvas-editor/canvas-editor.component.ts
undo(): void {
  if (this.paintLayer && this.paintLayer.getChildren().length > 0) {
    const children = this.paintLayer.getChildren();
    const lastStroke = children[children.length - 1];
    if (lastStroke) {
      this.redoStack.push(lastStroke);
      lastStroke.remove();
      this.paintLayer.batchDraw();
      this.canUndo.set(this.paintLayer.getChildren().length > 0);
      this.canRedo.set(true);
    }
  }
}
\`\`\`

---

### Try it yourself!
*Exercise:* Add a "Clear All" button to the UI that calls \`this.paintLayer.destroyChildren()\` and clears the history stack.
`;

const tut3 = `
# Tutorial 3: Realtime Collaboration (Socket.IO)

### What you'll learn:
- Emitting and listening to events in Angular
- Syncing live drawing data across multiple clients

**Prerequisites:** [Tutorial 2: Canvas Engine (Konva.js)](./02-canvas-engine.md)

---

## 1. Client-Side Socket Service
To keep our Angular components clean, we encapsulate all real-time logic in \`socket.service.ts\`.

\`\`\`typescript
// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private serverUrl = 'https://wall-painter.onrender.com';

  constructor() {
    this.socket = io(this.serverUrl, { autoConnect: false });
  }

  joinProjectRoom(projectId: string): void {
    if (!this.socket.connected) this.socket.connect();
    this.socket.emit('join-project', projectId);
  }

  on(eventName: string, callback: any): void {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }
}
\`\`\`

## 2. Server-Side Handlers
On the Express side, we listen for these events in \`socketHandler.ts\` and broadcast them to everyone else in the specific project room.

\`\`\`typescript
// src/sockets/socketHandler.ts
export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('join-project', (projectId) => {
      socket.join(projectId);
    });

    socket.on('layer-update', (data) => {
      // Broadcast to everyone else in the room
      socket.to(data.projectId).emit('layer-update-broadcast', data);
    });
  });
};
\`\`\`

## 3. Avoiding Feedback Loops
When receiving a \`layer-update-broadcast\` in Angular, it is critical to update the canvas *without* re-triggering another \`layer-update\` emission, or you'll create an infinite loop!

---

### Try it yourself!
*Exercise:* Implement a "Live Cursors" feature by emitting mouse coordinates in \`canvas-editor.component.ts\` (\`mousemove\`) and rendering tiny cursors for other users.
`;

const tut4 = `
# Tutorial 4: Backend Data & Auth

### What you'll learn:
- MongoDB schema design with Mongoose
- JSON Web Token (JWT) Authentication
- Cloudinary Integration for Assets

**Prerequisites:** [Tutorial 3: Realtime Collaboration (Socket.IO)](./03-realtime-collaboration.md)

---

## 1. MongoDB Schema Design
We use Mongoose to define strict schemas. Here is how we define a Project that stores Konva layer data.

\`\`\`typescript
// src/models/Project.ts
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  canvasState: { type: String, default: '[]' },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
\`\`\`

## 2. JWT Authentication
We protect our routes using a custom auth middleware that verifies JWTs.

\`\`\`typescript
// src/middleware/authMiddleware.ts
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed' });
  }
};
\`\`\`

## 3. Cloudinary Upload Flow
When users upload custom wall textures in the Angular \`asset-library-panel.html\`, the Express API proxies it directly to Cloudinary using \`multer-storage-cloudinary\`.

\`\`\`typescript
// src/routes/upload.routes.ts
import { upload } from '../config/cloudinary';

router.post('/upload', protect, upload.single('file'), (req, res) => {
  res.status(201).json({
    url: req.file.path,
    publicId: req.file.filename
  });
});
\`\`\`

---

### Try it yourself!
*Exercise:* Extend the \`User\` schema to include a \`role\` field (e.g., 'admin' or 'designer') and implement a \`protectAdmin\` middleware!
`;

const tut5 = `
# Tutorial 5: Advanced & Production Considerations

### What you'll learn:
- Deploying frontend to Vercel
- Deploying backend to Render
- Environment variable management

**Prerequisites:** [Tutorial 4: Backend Data & Auth](./04-backend-data-auth.md)

---

## 1. Vercel Frontend Deployment
Angular Single Page Applications (SPAs) need specific routing configurations on Vercel so that deep links don't return 404s. We solve this by adding a \`vercel.json\` to \`angular-client/\`:

\`\`\`json
// angular-client/vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
\`\`\`
*Pro-tip:* Ensure the Vercel **Output Directory** is set to \`dist/angular-client/browser\` (for Angular 17+)!

## 2. Render Backend Deployment
Render natively builds Node.js apps. However, it requires all TypeScript devDependencies to be installed during the production build. 

We ensure our \`package.json\` has \`typescript\` in dependencies, and we set our build command to:
\`\`\`bash
npm install --legacy-peer-deps && npm run build
\`\`\`

## 3. Environment Variables
In production, never hardcode URLs. In \`socket.service.ts\` and \`auth.service.ts\`, we updated the API targets to point to the live Render URL:

\`\`\`typescript
// src/app/services/socket.service.ts
private serverUrl = 'https://wall-painter.onrender.com';
\`\`\`
For security, tokens and database URIs must be stored securely in Render/Vercel dashboard environment settings.

---

### Try it yourself!
*Exercise:* Create an Angular \`environment.ts\` file to dynamically switch \`serverUrl\` between \`http://localhost:5000\` and \`https://wall-painter.onrender.com\` based on the build type!
`;

fs.writeFileSync(path.join(tutorialsDir, '01-fundamentals.md'), tut1.trim());
fs.writeFileSync(path.join(tutorialsDir, '02-canvas-engine.md'), tut2.trim());
fs.writeFileSync(path.join(tutorialsDir, '03-realtime-collaboration.md'), tut3.trim());
fs.writeFileSync(path.join(tutorialsDir, '04-backend-data-auth.md'), tut4.trim());
fs.writeFileSync(path.join(tutorialsDir, '05-advanced-production.md'), tut5.trim());

console.log("Tutorials successfully generated!");
