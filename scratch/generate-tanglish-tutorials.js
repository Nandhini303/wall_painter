const fs = require('fs');
const path = require('path');

const tutDir = path.join(__dirname, '..', 'tutorials');
const imgDir = path.join(tutDir, 'images');

if (!fs.existsSync(tutDir)) fs.mkdirSync(tutDir);
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);

// Copy images to the tutorials folder so they can be pushed to git
const srcMascot = 'C:\\Users\\Rishi\\.gemini\\antigravity-ide\\brain\\3dc299ec-6e8c-44e0-bde2-ac2e7d21def2\\mascot_avatar_1784540682419.png';
const srcUi = 'C:\\Users\\Rishi\\.gemini\\antigravity-ide\\brain\\3dc299ec-6e8c-44e0-bde2-ac2e7d21def2\\ui_mockup_1784540698747.png';

if (fs.existsSync(srcMascot)) fs.copyFileSync(srcMascot, path.join(imgDir, 'mascot.png'));
if (fs.existsSync(srcUi)) fs.copyFileSync(srcUi, path.join(imgDir, 'ui_mockup.png'));

const accountLinks = `
> **📚 Official Links & Accounts (Munbe Ready Pannidunga!)**
> - **MongoDB Atlas:** Create a free cluster at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register). Get your \`MONGODB_URI\`.
> - **Cloudinary:** Create a free account at [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free). Get your \`CLOUDINARY_URL\`.
`;

const tut1 = `
# 🎨 Tutorial 1: Project Setup & Architecture (Beginner + Tanglish Guide)

![Mascot](./images/mascot.png)

*“Vanga palagalam! Welcome to the Smart Wall Painter tutorial series! Namma inikku zero-la irundhu hero aaga porom. Oru periya Full-Stack (Angular + Express) app-a eppadi scratch-la irundhu start panni run panrathu nu paapom!”*

📘 **What you'll learn (Enna kethuka porom):**
- Monorepo structure eppadi work aaguthu.
- \`mkdir\` la irundhu frontend/backend run panra varaikum EXACT terminal commands.
- Angular 17 Signals & Express basics.

**Prerequisites:** System-la Node.js install aagirkanum. Avlodhan!

> **📖 New terms in this chapter (Pudhu Varthaigal):**
> - **Monorepo:** Oru main folder-kulla rendu thani thani projects (namma frontend & backend) irukkurathu.
> - **Signals:** Angular-la pudhusa vantha oru trick. Data change aana udane screen-a update panna ithu romba easy.

${accountLinks}

---

## 📘 Learn: Working Flow (Eppadi work aaguthu?)

Oru chinna diagram paapom. Namma app eppadi pesikuthu nu puriyum:

\`\`\`mermaid
graph LR
    A[Angular 17 (Browser)] <-->|Sockets (Real-time)| B(Express Server)
    B <-->|Mongoose| C[(MongoDB Database)]
    A -->|Upload| D[Cloudinary (Images)]
\`\`\`

---

## 🛠️ Build: Step-by-Step Execution (Unga pc-la run pannuvom)

*“Ellam command um correct-a type pannunga, onnu kooda miss panna koodathu!”*

### Step 1. Folders Create Pannuvom
Terminal open panni, oru pudhu folder create pannunga:

\`\`\`bash
# 1. Folder create pannunga
mkdir my-super-app

# 2. Antha folder-kulla ponga
cd my-super-app
\`\`\`

*(Actually, neenga existing code-a download pannalam using \`git clone https://github.com/Nandhini303/wall_painter.git\`, but structure puriyurathukaga namma empty-a yosipom. Cloning dhaan best!)*

### Step 2. Backend Setup
Backend folder-kulla poittu \`.env\` file create pannanum.

\`\`\`bash
cd express-server
\`\`\`

File peru exactly \`.env\` nu irukanum. Itha ulle podunga:
\`\`\`text
// file: express-server/.env
PORT=5000
MONGODB_URI=your_mongo_url
JWT_SECRET=supersecret
CLOUDINARY_URL=your_cloudinary_url
\`\`\`

### Step 3. Backend-a Run Pannuvom
Dependencies install panni start pannalam!
\`\`\`bash
npm install
npm run dev
\`\`\`
*Terminal-la "Backend listening on port 5000" nu varum!*

### Step 4. Frontend-a Run Pannuvom
Pudhu terminal open pannunga! Pazhaiyatha close pannidathinga.
\`\`\`bash
cd angular-client
npm install
npm start
\`\`\`
*Browser-la \`http://localhost:4200\` open panni paathinga na, namma UI theriyum!*

![Enhanced UI](./images/ui_mockup.png)

---

## 🧪 Practice: Build It Yourself (Neengale Try Pannunga!)

**Goal:** Oru pudhu Express route add panni, Angular-la call pannunga.

1. Backend \`index.ts\`-la \`app.get('/api/test')\` add pannunga.
2. Angular-la fetch panni console.log-la antha data-va print pannunga.

**✅ Check yourself:**
- [ ] Backend terminal error illama run aagutha?
- [ ] Angular console-la data vanthuducha?
`;

const tut2 = `
# 🎨 Tutorial 2: Canvas Engine (Konva.js - Easy Tanglish)

![Mascot](./images/mascot.png)

*“Super! App-a run pannitinga. Ippo Konva.js vachu canvas eppadi work aaguthu nu paapom. Idhu Photoshop mathiri drawing panna help pannum!”*

📘 **What you'll learn (Enna kethuka porom):**
- Konva Stage & Layers setup.
- Polygons draw panrathu.
- Undo/Redo logic.

**Prerequisites:** [Tutorial 1](./01-fundamentals.md) mudichurukanum.

${accountLinks}

---

## 📘 Learn: Hierarchy (Canvas structure)

Konva-la ellame oru tree mathiri than. Stage-kulla Layers, Layers-kulla shapes!

\`\`\`mermaid
graph TD
    A[Konva Stage] --> B[Background Layer]
    A --> C[Paint Layer]
    C --> D(Wall Polygons)
    C --> E(Images)
\`\`\`

---

## 🛠️ Build: Step-by-Step Drawing

### Step 1. Stage Initialization
HTML-la oru div irukum, atha Konva Stage-a mathuvom.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
initStage() {
  const container = this.canvasContainer.nativeElement;
  this.stage = new Konva.Stage({
    container: container,
    width: container.offsetWidth,
    height: container.offsetHeight,
  });
  
  // Layer add panniduvom!
  this.paintLayer = new Konva.Layer();
  this.stage.add(this.paintLayer);
}
\`\`\`

### Step 2. Polygons and Anchors (Pulligal)
Wall varaiyurappa, end points-la chinna circle vaipom, apo than user athai drag panna mudiyum.

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
      draggable: true, // Ithu romba mukkiyam!
    });
    this.polygonAnchorsLayer.add(anchor);
  }
}
\`\`\`

---

## 🧪 Practice: Build It Yourself (Neengale Try Pannunga!)

**Goal:** Oru pudhu tool (Circle tool) add pannunga.

**✅ Check yourself:**
- [ ] Toolbar-la circle button add pannitingala?
- [ ] Drag pannum pothu circle draw aagutha?
`;

const tut3 = `
# 🎨 Tutorial 3: Realtime Collaboration (Socket.IO Tanglish)

![Mascot](./images/mascot.png)

*“Oru aal draw panna innonu aal screen-la athu automatic a theriyanum la? Athuku than Socket.IO! Real-time magic-a ippo paapom.”*

📘 **What you'll learn (Enna kethuka porom):**
- Socket.IO client-server communication.
- Angular-la events emit panrathu.

**Prerequisites:** [Tutorial 2](./02-canvas-engine.md) mudichurukanum.

${accountLinks}

---

## 📘 Learn: Flow Diagram

\`\`\`mermaid
sequenceDiagram
    participant Neenga
    participant Server
    participant Friend
    
    Neenga->>Server: emit('layer-update', drawingData)
    Server-->>Friend: emit('layer-update-broadcast', drawingData)
    Note over Friend: Friend screen-la unga drawing theriyum!
\`\`\`

---

## 🛠️ Build: Code Setup

### Step 1. Express Server Handler
Backend-la data receive panni mathavangaluku send pannanum (Broadcast).

\`\`\`typescript
// file: express-server/src/sockets/socketHandler.ts
export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('layer-update', (data) => {
      // Ungala thavira matha ellarukum anupum!
      socket.to(data.projectId).emit('layer-update-broadcast', data);
    });
  });
};
\`\`\`

### Step 2. Angular Receiver
Mathavanga varaiyuratha namma screen-la kaatanum.

\`\`\`typescript
// file: angular-client/src/app/features/canvas-editor/canvas-editor.component.ts
this.socketService.on('layer-update-broadcast', (data) => {
  this.isRemoteUpdate = true; // Infinite loop varama thadukka idhu mukkiyam!
  this.loadCanvasData(data.layers);
});
\`\`\`

---

## 🧪 Practice: Build It Yourself (Neengale Try Pannunga!)

**Goal:** Live Cursors add pannunga! User mouse move aagum pothu, friend screen-la antha cursor theriyanum.

**✅ Check yourself:**
- [ ] \`mousemove\` event-a server-ku anuppitingala?
- [ ] Friend screen-la cursor move aagutha?
`;

const tut4 = `
# 🎨 Tutorial 4: Backend Data & Auth (DB Setup - Tanglish)

![Mascot](./images/mascot.png)

*“App super-a work aaguthu, aana refresh pannina ellam poiduthe? Database-la save panna than permanent! JWT vechu secure pannuvom vanga.”*

📘 **What you'll learn (Enna kethuka porom):**
- MongoDB schema & Mongoose.
- JWT login authentication.
- Cloudinary-la image upload.

**Prerequisites:** [Tutorial 3](./03-realtime-collaboration.md).

${accountLinks}

---

## 📘 Learn: Auth Flow

\`\`\`mermaid
graph TD
    A[Angular Login] -->|POST /login| B[Express Auth Route]
    B -->|Verify DB| C[(MongoDB)]
    B -->|Return Token| A
    A -->|Bearer Token| D[Secure API Routes]
\`\`\`

---

## 🛠️ Build: Backend Code

### Step 1. Mongoose Schema
Project-a eppadi save panrathu nu define pannuvom.

\`\`\`typescript
// file: express-server/src/models/Project.ts
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  canvasState: { type: String, default: '[]' }
});
export const Project = mongoose.model('Project', ProjectSchema);
\`\`\`

### Step 2. JWT Middleware
Yaru vena data-va maatha koodathu. Token irukavanga matum than API-a thoda mudiyum.

\`\`\`typescript
// file: express-server/src/middleware/authMiddleware.ts
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token illaye boss!' });
  // Token valid-a nu check pannum...
  next();
};
\`\`\`

---

## 🧪 Practice: Build It Yourself

**Goal:** Oru Pudhu API route \`POST /api/comments\` create panni athai JWT vechu protect pannunga.

**✅ Check yourself:**
- [ ] Postman-la token illama send pannina 401 error varutha?
- [ ] Token vachu send pannina DB-la save aagutha?
`;

const tut5 = `
# 🎨 Tutorial 5: Production Deployment (Hosting - Tanglish)

![Mascot](./images/mascot.png)

*“Namma computer-la work aaguthu, but ulagathula ellarum pakkanum la? Vercel and Render use panni host panniduvom! (From localhost to global!)”*

📘 **What you'll learn (Enna kethuka porom):**
- Vercel (Frontend hosting).
- Render (Backend Node.js hosting).

**Prerequisites:** [Tutorial 4](./04-backend-data-auth.md).

${accountLinks}

---

## 📘 Learn: Hosting Architecture

\`\`\`mermaid
graph LR
    A[World Wide Web] -->|Visits UI| B[Vercel (Angular)]
    B -->|API Calls| C[Render (Express)]
    C -->|Stores Data| D[(MongoDB Atlas)]
\`\`\`

---

## 🛠️ Build: Deployment Steps

### Step 1. Vercel Configuration (Angular)
Angular SPA-va Vercel-la host panna, \`vercel.json\` mukkiyam, illati refresh panna 404 error varum.

\`\`\`json
// file: angular-client/vercel.json
{
  "outputDirectory": "dist/angular-client/browser",
  "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ]
}
\`\`\`

### Step 2. Render Environment
Render-la Node app host panna, build command correct-a kudukanum:

**Build Command:** \`npm install --legacy-peer-deps && npm run build\`
**Start Command:** \`npm start\`

*Kandippa \`.env\` variables ellam Render dashboard-la add pannidanum!*

### Step 3. Pointing Angular to Render
Localhost-ku badhila, live URL-ku mathanum.

\`\`\`typescript
// file: angular-client/src/app/services/socket.service.ts
private serverUrl = 'https://wall-painter.onrender.com';
\`\`\`

---

## 🧪 Practice: Build It Yourself

**Goal:** Unga sondha github repo-va Vercel-la connect panni deploy pannunga!

**✅ Check yourself:**
- [ ] Vercel link-la app load aagutha?
- [ ] Drawing panna, Render backend-la data poyitu varutha?
`;

const tut6 = `
# 🎨 Tutorial 6: Capstone Project (Final Exam - Tanglish)

![Mascot](./images/mascot.png)

*“Idhu thaan unga final project! Oru full feature-a end-to-end eppadi build panrathu nu paapom: Layers Panel!”*

📘 **What you'll learn (Enna kethuka porom):**
- UI, Backend, Database nu munnathiyum connect panni oru mass feature build panrathu.

**Prerequisites:** Tutorial 1 to 5 completely understand aagirkanum.

---

## 📘 Learn: The Goal

Oru list of layers UI-la kaatanum. Atha drag panni reorder pannina, DB-la update aagi mathavangalukum live-a sync aaganum.

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Angular
    participant Server
    
    User->>Angular: Layers Reorder Panran
    Angular->>Server: Emit 'layer-reorder'
    Server->>Database: Save pudhu order
    Server-->>All: Broadcast 'layer-reorder-sync'
\`\`\`

---

## 🛠️ Build: Steps to Follow

### Step 1. Angular Component
Layers list panna oru component ezhuthunga.

\`\`\`html
<!-- file: angular-client/src/app/features/canvas-editor/components/layers-panel/layers-panel.html -->
<div class="layer-list">
  @for (layer of canvasLayers(); track layer.id) {
    <div>{{ layer.name }}</div>
  }
</div>
\`\`\`

### Step 2. Express Route
Backend-la reorder event vandha, atha receive panni save pannanum.

\`\`\`typescript
// file: express-server/src/sockets/socketHandler.ts
socket.on('layer-reorder', (newOrder) => {
  // Save to DB...
  socket.to(projectId).emit('layer-reorder-sync', newOrder);
});
\`\`\`

---

## 🧪 Practice: Finish it!

**Goal:** Intha full flow-va mudinga.

**✅ Check yourself:**
- [ ] Layer-a drag panni mela pota, athu drawing-la front-la theriyutha?
- [ ] Innonu browser open panna antha change live-a varutha?

*“Awesome! Neenga ippo oru pro MEAN stack developer aagitinga! Vaazhthukkal!”*
`;

fs.writeFileSync(path.join(tutDir, '01-fundamentals.md'), tut1.trim());
fs.writeFileSync(path.join(tutDir, '02-canvas-engine.md'), tut2.trim());
fs.writeFileSync(path.join(tutDir, '03-realtime-collaboration.md'), tut3.trim());
fs.writeFileSync(path.join(tutDir, '04-backend-data-auth.md'), tut4.trim());
fs.writeFileSync(path.join(tutDir, '05-advanced-production.md'), tut5.trim());
fs.writeFileSync(path.join(tutDir, '06-capstone-project.md'), tut6.trim());

console.log("Tanglish Interactive Tutorials Generated with Images!");
