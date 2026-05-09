import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ILogger } from "../../application/interface/services/ILogger";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IJwtService } from "../../application/interface/services/IJwtService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { AppConfig } from "../../config/AppConfig";

import { UserRole } from "../../domain/enums/UserRole";

interface AuthenticatedUser {
  id: string;
  orgId: string;
  role: UserRole;
  [key: string]: unknown;
}

@injectable()
export class SocketServer {
  public io!: Server;

  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.AppConfig) private config: AppConfig,
  ) {}

  public initialize(httpServer: HttpServer, allowedOrigins: string | string[]) {
    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: Token not found"));
      }

      try {
        const decoded = jwt.verify(
          token,
          this.config.jwt.accessSecret,
        ) as AuthenticatedUser;

        const isRevoked = await this._jwtService.isTokenRevoked(token);
        if (isRevoked) {
          return next(
            new Error("Authentication error : Token has been revoked"),
          );
        }

        const user = await this._userRepo.findById(decoded.id);
        if (!user || user.status !== "ACTIVE") {
          return next(new Error("Authentication error : Account is suspended"));
        }

        socket.data.user = decoded;
        socket.data.token = token;
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
            user.role === UserRole.ORG_MANAGER && project.orgId === user.orgId;
          const isMember =
            user.role === UserRole.TEAM_MEMBER &&
            project.teamMemberIds?.includes(user.id);
          const isAdmin = user.role === UserRole.SUPER_ADMIN;

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
    }

    const securityInterval = setInterval(
      async () => {
        try {
          const token = socket.data.token;
          const isRevoked = await this._jwtService.isTokenRevoked(token);

          if (isRevoked) {
            this._logger.warn(
              `Forcibly disconnecting ${user.id} (Token Revoked)`,
            );
            socket.emit("session_expired", {
              message: "Your session has expired. Please login again",
            });
            socket.disconnect(true);
            clearInterval(securityInterval);
          }
          const dbUser = await this._userRepo.findById(user.id);
          if (!dbUser || dbUser.status !== "ACTIVE") {
            this._logger.warn(
              `Forcibly disconnecting ${user.id} (User Not Found or Suspended)`,
            );
            socket.emit("session_expired", {
              message:
                "Your account is no longer active. Please contact support",
            });
            socket.disconnect(true);
            clearInterval(securityInterval);
          }
        } catch (error) {
          this._logger.error("Token Check failed : " + error);
        }
      },
      5 * 60 * 1000,
    );

    socket.on("disconnect", () => {
      clearInterval(securityInterval);
      this._logger.info(`User ${user.id} disconnected`);
    });
  }
}
