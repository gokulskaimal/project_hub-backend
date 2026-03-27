import { inject, injectable } from "inversify";
import { Server } from "socket.io";
import { ISocketService } from "../interface/services/ISocketService";
import { ILogger } from "../interface/services/ILogger";
import { TYPES } from "../container/types";

@injectable()
export class SocketService implements ISocketService {
  private _io: Server | null = null;

  constructor(@inject(TYPES.ILogger) private _logger: ILogger) {}

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
      this._logger.info(
        `[SocketService] Emitting '${event}' to room 'org:${orgId}'`,
      );
      this._io.to(`org:${orgId}`).emit(event, data);
    } else {
      this._logger.warn("[SocketService] IO instance not set!");
    }
  }

  emitToRoleInOrg<T>(
    orgId: string,
    role: string,
    event: string,
    data: T,
  ): void {
    if (this._io) {
      this._logger.info(
        `[SocketService] Emitting '${event}' to room 'org:${orgId}:role:${role}'`,
      );
      this._io.to(`org:${orgId}:role:${role}`).emit(event, data);
    }
  }

  emitToProject<T>(projectId: string, event: string, data: T): void {
    if (this._io) {
      this._io.to(`project:${projectId}`).emit(event, data);
    }
  }

  emitToRole<T>(role: string, event: string, data: T): void {
    if (this._io) {
      this._logger.info(
        `[SocketService] Emitting '${event}' to room 'role:${role}'`,
      );
      this._io.to(`role:${role}`).emit(event, data);
    }
  }
}
