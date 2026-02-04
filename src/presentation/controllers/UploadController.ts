import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IFileService } from "../../infrastructure/interface/services/IFileService";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class UploadController {
  constructor(@inject(TYPES.IFileService) private _fileService: IFileService) {}

  uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      next(error);
    }
  };
}
