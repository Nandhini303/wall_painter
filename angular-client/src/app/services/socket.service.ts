import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private serverUrl = 'https://wall-painter.onrender.com';

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = io(this.serverUrl, {
      autoConnect: false
    });
  }

  connectSocket(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnectSocket(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  joinProjectRoom(projectId: string): void {
    this.connectSocket();
    this.socket.emit('join-project', projectId);
  }

  leaveProjectRoom(projectId: string): void {
    this.socket.emit('leave-project', projectId);
  }

  sendDrawDelta(projectId: string, delta: any): void {
    this.socket.emit('draw-delta', { projectId, delta });
  }

  sendLayerUpdate(projectId: string, layerId: string, layers: any): void {
    this.socket.emit('layer-update', { projectId, layerId, layers });
  }

  onDrawDelta(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('draw-delta-broadcast', (delta: any) => {
        observer.next(delta);
      });
    });
  }

  onLayerUpdate(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('layer-update-broadcast', (data: any) => {
        observer.next(data);
      });
    });
  }

  on(eventName: string, callback: any): void {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }
}
