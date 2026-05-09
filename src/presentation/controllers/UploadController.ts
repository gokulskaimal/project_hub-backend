import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IFileService } from "../../application/interface/services/IFileService";
import { ResponseHandler } from "../utils/ResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

@injectable()
export class UploadController {
  constructor(@inject(TYPES.IFileService) private _fileService: IFileService) {}

  uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return ResponseHandler.validationError(res, "No file uploaded");
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

    ResponseHandler.success(res, { url }, "File uploaded successfully");
  });
}
