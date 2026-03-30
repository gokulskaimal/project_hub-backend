import { Request, Response, NextFunction } from "express";

export interface IAdminInvoiceController {
  getInvoices(req: Request, res: Response, next: NextFunction): Promise<void>;
}
