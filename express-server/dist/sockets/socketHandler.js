"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`WebSocket client connected: ${socket.id}`);
        // Join room for a specific project
        socket.on('join-project', (projectId) => {
            socket.join(`project:${projectId}`);
            console.log(`Socket ${socket.id} joined project room: project:${projectId}`);
        });
        // Leave room
        socket.on('leave-project', (projectId) => {
            socket.leave(`project:${projectId}`);
            console.log(`Socket ${socket.id} left project room: project:${projectId}`);
        });
        // Broadcast paint mask delta changes
        socket.on('draw-delta', (data) => {
            socket.to(`project:${data.projectId}`).emit('draw-delta-broadcast', data.delta);
        });
        // Broadcast active layer updates (layer opacity, colors, visibility)
        socket.on('layer-update', (data) => {
            socket.to(`project:${data.projectId}`).emit('layer-update-broadcast', {
                layerId: data.layerId,
                layers: data.layers
            });
        });
        // Handle client disconnect
        socket.on('disconnect', () => {
            console.log(`WebSocket client disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
