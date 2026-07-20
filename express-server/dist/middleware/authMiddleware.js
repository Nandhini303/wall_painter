"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication token required.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = await authService.verifyToken(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: err.message || 'Unauthorized access.' });
    }
};
exports.authMiddleware = authMiddleware;
