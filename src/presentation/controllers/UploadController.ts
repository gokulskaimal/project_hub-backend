import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IFileService } from "../../infrastructure/interface/services/IFileService";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../middleware/ErrorMiddleware";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

@injectable()
export class UploadController {
  constructor(@inject(TYPES.IFileService) private _fileService: IFileService) {}

  private sendSuccess<T>(res: Response, data: T, message: string = "Success") {
    res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const allowedFolders = ["chat", "task", "profile", "organization"];
    const requestedFolder = req.body.folder || "general";
    const folder = allowedFolders.includes(requestedFolder)
      ? requestedFolder
      : "general";

    const ownerId =
      (req as AuthenticatedRequest).user?.orgId ||
      (req as AuthenticatedRequest).user?.id;

    const url = await this._fileService.uploadFile(req.file, folder, ownerId);

    this.sendSuccess(res, { url }, "File uploaded successfully");
  });
}
