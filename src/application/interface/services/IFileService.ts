export interface IFileService {
  uploadFile(
    file: Express.Multer.File,
    folder?: string,
    ownerId?: string,
  ): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}
