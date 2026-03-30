import { injectable, inject } from "inversify";
import { IFileService } from "../../application/interface/services/IFileService";
import { v2 as cloudinary } from "cloudinary";
import { TYPES } from "../container/types";
import { AppConfig } from "../../config/AppConfig";

@injectable()
export class CloudinaryService implements IFileService {
  constructor(@inject(TYPES.AppConfig) private readonly config: AppConfig) {
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
      const publicId = fileUrl.split("/").pop()?.split(".")[0];
      if (publicId)
        await cloudinary.uploader.destroy(`project-hub/chat/${publicId}`);
    } catch (error) {
      console.error("Error deleting file from Cloudinary", error);
    }
  }
}
