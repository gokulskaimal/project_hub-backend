import { Router } from "express";
import multer from "multer";
import { Container } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UploadController } from "../controllers/UploadController";
import { authMiddleware } from "../middleware/AuthMiddleware";
import { API_ROUTES } from "../../infrastructure/config/apiRoutes.constant";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";

export function createUploadRoutes(container: Container): Router {
  const router = Router();
  const maxFileSizeMb = 5;
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-zip-compressed",
  ]);

  const upload = multer({
    storage: multer.memoryStorage(), // Store in memory for Cloudinary
    limits: { fileSize: maxFileSizeBytes },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.has(file.mimetype)) {
        const err = new Error("Unsupported file type");
        (err as { status?: number; code?: string }).status =
          StatusCodes.UNSUPPORTED_MEDIA_TYPE;
        (err as { code?: string }).code = "UNSUPPORTED_FILE_TYPE";
        return cb(err);
      }
      return cb(null, true);
    },
  });

  const uploadController = container.get<UploadController>(
    TYPES.UploadController,
  );

  router.use(API_ROUTES.UPLOAD.BASE, authMiddleware);

  router.post(
    API_ROUTES.UPLOAD.FILE,
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (!err) return next();
        const status =
          (err as { status?: number }).status ||
          ((err as { code?: string }).code === "LIMIT_FILE_SIZE"
            ? StatusCodes.PAYLOAD_TOO_LARGE
            : StatusCodes.BAD_REQUEST);
        const message =
          (err as Error).message ||
          ((err as { code?: string }).code === "LIMIT_FILE_SIZE"
            ? `File too large (max ${maxFileSizeMb}MB)`
            : "File upload error");
        res.status(status).json({
          success: false,
          error: {
            code:
              (err as { code?: string }).code ||
              (status === StatusCodes.PAYLOAD_TOO_LARGE
                ? "UPLOAD_TOO_LARGE"
                : "UPLOAD_ERROR"),
            message,
          },
        });
      });
    },
    (req, res, next) =>
      uploadController.uploadFile(req as AuthenticatedRequest, res, next),
  );

  return router;
}
