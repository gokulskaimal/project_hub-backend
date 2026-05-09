import { injectable, inject } from "inversify";
import { IFileService } from "../../application/interface/services/IFileService";
import { v2 as cloudinary } from "cloudinary";
import { TYPES } from "../container/types";
import { AppConfig } from "../../config/AppConfig";
import { ILogger } from "../../application/interface/services/ILogger";

@injectable()
export class CloudinaryService implements IFileService {
  constructor(
    @inject(TYPES.AppConfig) private readonly config: AppConfig,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {
    cloudinary.config({
      cloud_name: this.config.upload.cloudName,
      api_key: this.config.upload.apiKey,
      api_secret: this.config.upload.apiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "chat",
    ownerId?: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const folderPath = ownerId
        ? `project-hub/${ownerId}/${folder}`
        : `project-hub/${folder}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderPath, resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || "");
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/;
      const match = fileUrl.match(regex);
      const publicId = match ? match[1] : null;
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === "ok") {
          this._logger.info(`Deleted file from Cloudinary: ${publicId}`);
        } else {
          this._logger.warn(
            `Failed to delete file from Cloudinary: ${publicId}`,
          );
        }
      } else {
        this._logger.warn(`Could not extract publicId from URL: ${fileUrl}`);
      }
    } catch (error) {
      this._logger.error(`Error deleting file from Cloudinary: ${error}`);
    }
  }
}
