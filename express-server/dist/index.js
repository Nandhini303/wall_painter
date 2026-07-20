"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const routes_1 = __importDefault(require("./routes"));
const socketHandler_1 = require("./sockets/socketHandler");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // In production, replace with specific domain client origins
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});
const PORT = process.env.PORT || 5000;
// Security and optimization middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false // Disable to allow flex iframe mockup loading easily
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Apply rate limiting on auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);
// Bind base API route
app.use('/api', routes_1.default);
// Test ping route
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});
// Setup Socket.IO
(0, socketHandler_1.setupSocketHandlers)(io);
// Catch-all Global Error handler middleware
app.use(errorMiddleware_1.errorMiddleware);
// Boot server
const start = async () => {
    await (0, db_1.connectDB)();
    server.listen(PORT, () => {
        console.log(`Smart Wall Paint Visualizer Backend listening on port ${PORT}`);
    });
};
start();
