import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IFileService } from "../../infrastructure/interface/services/IFileService";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../middleware/ErrorMiddleware";

@injectable()
export class UploadController {
  constructor(@inject(TYPES.IFileService) private _fileService: IFileService) {}

  uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }
    const folder = req.body.folder;
    const url = await this._fileService.uploadFile(req.file, folder);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "File uploaded successfully",
      data: { url },
    });
  });
}
