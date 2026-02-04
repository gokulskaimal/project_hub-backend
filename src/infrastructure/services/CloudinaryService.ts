import { injectable } from "inversify";
import { IFileService } from "../interface/services/IFileService";
import { v2 as cloudinary } from "cloudinary";

@injectable()
export class CloudinaryService implements IFileService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "chat",
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `project-hub/${folder}` },
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
