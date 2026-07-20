import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export const setupSocketHandlers = (io: Server): void => {
  ioInstance = io;
  io.on('connection', (socket: Socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    // Join room for a specific project
    socket.on('join-project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project room: project:${projectId}`);
    });

    // Leave room
    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`Socket ${socket.id} left project room: project:${projectId}`);
    });

    // Broadcast paint mask delta changes
    socket.on('draw-delta', (data: { projectId: string; delta: any }) => {
      socket.to(`project:${data.projectId}`).emit('draw-delta-broadcast', data.delta);
    });

    // Broadcast active layer updates (layer opacity, colors, visibility)
    socket.on('layer-update', (data: { projectId: string; layerId: string; layers: any }) => {
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

export const getIo = (): Server | null => {
  return ioInstance;
};
