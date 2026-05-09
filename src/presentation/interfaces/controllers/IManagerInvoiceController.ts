import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../presentation/middleware/types/AuthenticatedRequest";

export interface IManagerInvoiceController {
  getInvoices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void | Promise<void>;
}
