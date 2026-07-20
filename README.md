<div align="center">
  
  # 🎨 Smart Wall Painter 
  
  <p align="center">
    <strong>A real-time, collaborative digital canvas for architectural planning and interior design visualization.</strong>
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#author">Author</a>
  </p>
</div>

<br>

## 🚀 Overview

Smart Wall Painter is a robust, full-stack application designed to revolutionize interior design prototyping. Whether you are painting a wall digitally, adding assets seamlessly from Cloudinary, or collaborating in real-time with other designers, this platform provides an intuitive and frictionless experience. 

Built with modern web technologies, the app separates the frontend (Angular) and backend (Express) to deliver scalable, instantaneous collaboration powered by Socket.IO.

---

## 💻 Tech Stack

**Frontend (Client)**
* **Framework:** Angular 17+ 
* **Canvas Engine:** Konva.js
* **Styling:** SCSS, Open Color
* **State Management:** Angular Signals / RxJS
* **Hosting:** [Vercel](https://vercel.com)

**Backend (API)**
* **Environment:** Node.js
* **Framework:** Express.js
* **Real-Time Communication:** Socket.IO
* **Database:** MongoDB
* **Asset Storage:** Cloudinary
* **Hosting:** [Render](https://render.com)

---

## ✨ Features

- **🖌️ Interactive Canvas:** Draw, add polygons, edit vertices, and apply wall textures flawlessly using Konva.js.
- **⚡ Real-Time Collaboration:** See updates instantly! Multiple users can work on the same design board without conflicts thanks to Socket.IO.
- **☁️ Cloud Asset Management:** Upload and manage assets natively within the app, all synchronized via Cloudinary.
- **💾 Auto-Save & Drafts:** Never lose your work. Your designs are automatically saved and restorable.
- **🔐 Secure Authentication:** Enterprise-grade security with JWT and bcrypt to protect your designs.
- **📱 Responsive UI:** Fully designed from the ground up for a premium, distraction-free creative experience.

---

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* [Node.js](https://nodejs.org/en/) installed on your local machine.

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Nandhini303/wall_painter.git
   cd wall_painter
   ```

2. **Start the Backend:**
   ```sh
   cd express-server
   npm install
   npm run dev
   ```
   *(Ensure you have your `.env` variables set up for MongoDB, JWT, and Cloudinary)*

3. **Start the Frontend:**
   Open a new terminal window:
   ```sh
   cd angular-client
   npm install
   npm start
   ```

4. **View the App:**
   Open your browser and navigate to `http://localhost:4200`.

---

<br>

<div align="center">
  <p>Built with ❤️ and passion for code.</p>
  <h3>Created by <strong>Nandhini</strong></h3>
  <a href="https://github.com/Nandhini303">GitHub Profile</a>
</div>
