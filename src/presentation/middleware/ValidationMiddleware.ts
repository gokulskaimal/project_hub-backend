import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query, and params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Collect validation errors into a key-value map for "details"
        const details: Record<string, string> = {};
        error.errors.forEach((e) => {
          const field = e.path.join(".");
          details[field] = e.message;
        });

        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details,
          },
        });
      }
      next(error);
    }
  };
