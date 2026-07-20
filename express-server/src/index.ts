import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import apiRoutes from './routes';
import { setupSocketHandlers } from './sockets/socketHandler';
import { errorMiddleware } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, replace with specific domain client origins
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

// Security and optimization middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable to allow flex iframe mockup loading easily
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// Bind base API route
app.use('/api', apiRoutes);

// Test ping route
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Setup Socket.IO
setupSocketHandlers(io);

// Catch-all Global Error handler middleware
app.use(errorMiddleware);

// Boot server
const start = async () => {
  await connectDB();
  // Start Server
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production') {
    server.listen(PORT, () => {
      console.log(`Smart Wall Paint Visualizer Backend listening on port ${PORT}`);
    });
  }
};

start();

// Export for Vercel Serverless
export default app;
