import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IChatRepo } from "../../infrastructure/interface/repositories/IChatRepo";
import { ISendMessageUseCase } from "../interface/useCases/ISendMessageUseCase";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { ChatMessage } from "../../domain/entities/ChatMessage";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

// Imports updated above
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { NotificationType } from "../../domain/enums/NotificationType";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUseCase: ICreateNotificationUseCase,
  ) {}

  async execute(
    senderId: string,
    projectId: string,
    content: string,
    type?: "TEXT" | "FILE",
  ): Promise<ChatMessage> {
    const project = await this._projectRepo.findById(projectId);
    if (!project) {
      throw new EntityNotFoundError("Project not found");
    }

    const message = await this._chatRepo.create({
      senderId,
      projectId,
      content,
      type,
    });

    this._socketService.emitToProject(projectId, "chat:message", message);

    const notificationPayload = {
      projectId,
      projectName: project.name,
      senderName: message.senderName,
      content: message.content,
      messageId: message.id,
    };

    // 1. Notify Assigned Team Members
    if (project.teamMemberIds) {
      project.teamMemberIds.forEach(async (memberId) => {
        if (memberId.toString() === senderId.toString()) return;

        // Live Toast (Clickable to Chat)
        this._socketService.emitToUser(
          memberId.toString(),
          "chat:notification",
          notificationPayload,
        );

        // Persistent Notification (For Bell Panel)
        await this._createNotificationUseCase
          .execute(
            memberId.toString(),
            "New Chat Message",
            `New message from ${message.senderName} in ${project.name}`,
            NotificationType.INFO,
            `/member/projects/${projectId}`,
          )
          .catch((err: unknown) =>
            console.error("Failed to create chat notification", err),
          );
      });
    }

    // 2. Notify Organization Managers (Managers are not always in teamMemberIds)
    if (project.orgId) {
      const managers = await this._userRepo.findByOrgAndRole(
        project.orgId,
        UserRole.ORG_MANAGER,
      );
      managers.forEach(async (manager) => {
        if (manager.id.toString() !== senderId.toString()) {
          // Don't notify if manager sent it
          // Live Toast (Clickable to Chat)
          this._socketService.emitToUser(
            manager.id.toString(),
            "chat:notification",
            notificationPayload,
          );

          // Persistent Notification (For Bell Panel)
          await this._createNotificationUseCase
            .execute(
              manager.id.toString(),
              "New Chat Message",
              `New message from ${message.senderName} in ${project.name}`,

              NotificationType.INFO,
              `/manager/projects/${projectId}`, // Corrected link for managers
            )
            .catch((err: unknown) =>
              console.error("Failed to create chat notification", err),
            );
        }
      });
    }

    return message;
  }
}
