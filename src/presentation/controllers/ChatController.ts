import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISendMessageUseCase } from "../../application/interface/useCases/ISendMessageUseCase";
import { IGetProjectMessagesUseCase } from "../../application/interface/useCases/IGetProjectMessagesUseCase";
import { IEditMessageUseCase } from "../../application/interface/useCases/IEditMessageUseCase";
import { IDeleteMessageUseCase } from "../../application/interface/useCases/IDeleteMessageUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

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

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const { limit, before } = req.query;

      const result = await this._getProjectMessagesUC.execute(
        projectId,
        limit ? Number(limit) : undefined,
        before as string | undefined,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Messages fetched successfully",
        data: result.messages,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      next(error);
    }
  };

  editMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const userId = (req as AuthenticatedRequest).user!.id;
      const message = await this._editMessageUC.execute(
        messageId,
        userId,
        content,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Message updated successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const userId = (req as AuthenticatedRequest).user!.id;
      await this._deleteMessageUC.execute(messageId, userId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Message deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
