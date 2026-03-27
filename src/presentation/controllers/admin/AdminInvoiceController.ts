import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IGetAdminInvoicesUseCase } from "../../../application/interface/useCases/IGetAdminInvoicesUseCase";
import { IAdminInvoiceController } from "../../../application/interface/controllers/IAdminInvoiceController";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";

@injectable()
export class AdminInvoiceController implements IAdminInvoiceController {
  constructor(
    @inject(TYPES.IGetAdminInvoicesUseCase)
    private _getAdminInvoicesUC: IGetAdminInvoicesUseCase,
  ) {}

  private sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ): void {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  getInvoices = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const authReq = req as AuthenticatedRequest;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const sort = req.query.sort as string | undefined;
      const planType = req.query.planType as string | undefined;

      const result = await this._getAdminInvoicesUC.execute(
        authReq.user!.id,
        page,
        limit,
        search,
        status,
        sort,
        planType,
      );

      this.sendSuccess(res, result, "Invoices fetched successfully");
    },
  );
}
