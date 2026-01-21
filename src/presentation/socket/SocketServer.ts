import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

interface AuthenticatedUser {
  id: string;
  orgId: string;
  role: string;
  [key: string]: unknown;
}

@injectable()
export class SocketServer {
  public io!: Server;

  constructor(@inject(TYPES.ILogger) private _logger: ILogger) {}

  public initialize(httpServer: HttpServer, allowedOrigins: string | string[]) {
    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token not found"));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET!,
        ) as AuthenticatedUser;
        socket.data.user = decoded;
        next();
      } catch {
        next(new Error("Authentication error: Invalid token"));
      }
    });

    this.io.on("connection", (socket) => {
      this.handleConnection(socket);
    });

    this._logger.info("Socket is initialized");
    return this.io;
  }

  private handleConnection(socket: Socket) {
    const user = socket.data.user;
    if (!user) return;

    this._logger.info(`User ${user.id} connected`);
    socket.join(`user:${user.id}`);
    this._logger.info(`User joined room: user:${user.id}`);

    if (user.orgId) {
      socket.join(`org:${user.orgId}`);
      this._logger.info(`User joined room: org:${user.orgId}`);
    } else {
      this._logger.warn(`User ${user.id} has no orgId, not joining org room`);
    }

    socket.on("disconnect", () => {
      this._logger.info(`User ${user.id} disconnected`);
    });
  }
}
