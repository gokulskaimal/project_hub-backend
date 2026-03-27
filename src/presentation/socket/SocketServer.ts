import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";

interface AuthenticatedUser {
  id: string;
  orgId: string;
  role: string;
  [key: string]: unknown;
}

@injectable()
export class SocketServer {
  public io!: Server;

  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
  ) {}

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

      socket.on("join-project", async (projectId: string) => {
        try {
          const user = socket.data.user;
          if (!user) return;

          const project = await this._projectRepo.findById(projectId);
          if (!project) return;

          // Authorization Check
          const isManager =
            user.role === "ORG MANAGER" && project.orgId === user.orgId;
          const isMember =
            user.role === "TEAM MEMBER" &&
            project.teamMemberIds?.includes(user.id);
          const isAdmin = user.role === "SUPER ADMIN";

          if (isManager || isMember || isAdmin) {
            this._logger.info(
              `User ${user.id} joined project room: project:${projectId}`,
            );
            socket.join(`project:${projectId}`);
          } else {
            this._logger.warn(
              `User ${user.id} unauthorized attempt to join room: project:${projectId}`,
            );
          }
        } catch (error) {
          this._logger.error(`Failed to join socket project room: ${error}`);
        }
      });

      socket.on("leave-project", (projectId: string) => {
        this._logger.info(
          `User ${socket.data.user?.id} left project room: project:${projectId}`,
        );
        socket.leave(`project:${projectId}`);
      });
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
    socket.join(`role:${user.role}`);

    if (user.orgId) {
      socket.join(`org:${user.orgId}`);
      this._logger.info(`User joined room: org:${user.orgId}`);

      // [NEW] Role-specific room for targeted role broadcasts
      socket.join(`org:${user.orgId}:role:${user.role}`);
      this._logger.info(
        `User joined role-specific room: org:${user.orgId}:role:${user.role}`,
      );
    } else {
      this._logger.warn(`User ${user.id} has no orgId, not joining org room`);
    }

    socket.on("disconnect", () => {
      this._logger.info(`User ${user.id} disconnected`);
    });
  }
}
