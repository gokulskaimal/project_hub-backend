import { injectable } from "inversify";
import { Server } from "socket.io";
import { ISocketService } from "../interface/services/ISocketService";

@injectable()
export class SocketService implements ISocketService {
  private _io: Server | null = null;

  public setIO(io: Server) {
    this._io = io;
  }

  emitToUser<T>(userId: string, event: string, data: T): void {
    if (this._io) {
      this._io.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToOrganization<T>(orgId: string, event: string, data: T): void {
    if (this._io) {
      console.log(`[SocketService] Emitting '${event}' to room 'org:${orgId}'`);
      this._io.to(`org:${orgId}`).emit(event, data);
    } else {
      console.warn("[SocketService] IO instance not set!");
    }
  }

  emitToProject<T>(projectId: string, event: string, data: T): void {
    if (this._io) {
      this._io.to(`project:${projectId}`).emit(event, data);
    }
  }
}
