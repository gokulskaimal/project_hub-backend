import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISendMessageUseCase } from "../../application/interface/useCases/ISendMessageUseCase";
import { IGetProjectMessagesUseCase } from "../../application/interface/useCases/IGetProjectMessagesUseCase";
import { IEditMessageUseCase } from "../../application/interface/useCases/IEditMessageUseCase";
import { IDeleteMessageUseCase } from "../../application/interface/useCases/IDeleteMessageUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { ResponseHandler } from "../utils/ResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import { toChatMessageDTO } from "../../application/dto/ChatMessageDTO";

@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.ISendMessageUseCase)
    private _sendMessageUC: ISendMessageUseCase,
    @inject(TYPES.IGetProjectMessagesUseCase)
    private _getProjectMessagesUC: IGetProjectMessagesUseCase,
    @inject(TYPES.IEditMessageUseCase)
    private _editMessageUC: IEditMessageUseCase,
    @inject(TYPES.IDeleteMessageUseCase)
    private _deleteMessageUC: IDeleteMessageUseCase,
  ) {}

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { content, type, fileUrl } = req.body;
    const userId = (req as AuthenticatedRequest).user!.id;

    const message = await this._sendMessageUC.execute(
      userId,
      projectId,
      content,
      type,
      fileUrl,
    );

    ResponseHandler.success(
      res,
      toChatMessageDTO(message),
      "Message sent successfully",
    );
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { limit, before } = req.query;
    const userId = (req as AuthenticatedRequest).user!.id;

    const result = await this._getProjectMessagesUC.execute(
      projectId,
      userId,
      limit ? Number(limit) : undefined,
      before as string | undefined,
    );

    ResponseHandler.success(
      res,
      {
        messages: result.messages.map(toChatMessageDTO),
        nextCursor: result.nextCursor,
      },
      "Messages fetched successfully",
    );
  });

  editMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = (req as AuthenticatedRequest).user!.id;
    const message = await this._editMessageUC.execute(
      messageId,
      userId,
      content,
    );

    ResponseHandler.success(
      res,
      toChatMessageDTO(message),
      "Message updated successfully",
    );
  });

  deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;
    await this._deleteMessageUC.execute(messageId, userId);

    ResponseHandler.success(res, null, "Message deleted successfully");
  });
}
