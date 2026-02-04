import { Router } from "express";
import multer from "multer";
import { Container } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UploadController } from "../controllers/UploadController";
import { authMiddleware } from "../middleware/AuthMiddleware";

export function createUploadRoutes(container: Container): Router {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for Cloudinary

  const uploadController = container.get<UploadController>(
    TYPES.UploadController,
  );

  router.post(
    "/",
    authMiddleware,
    upload.single("file"),
    uploadController.uploadFile,
  );

  return router;
}
