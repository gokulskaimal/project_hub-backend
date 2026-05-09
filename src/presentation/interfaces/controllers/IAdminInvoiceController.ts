import { NextFunction, Request, Response } from "express";

export interface IAdminInvoiceController {
  getInvoices(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Promise<void>;
}
