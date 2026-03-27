import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IGetOrgInvoicesUseCase } from "../../../application/interface/useCases/IGetOrgInvoicesUseCase";
import { IManagerInvoiceController } from "../../../application/interface/controllers/IManagerInvoiceController";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { ValidationError } from "../../../domain/errors/CommonErrors";

@injectable()
export class ManagerInvoiceController implements IManagerInvoiceController {
  constructor(
    @inject(TYPES.IGetOrgInvoicesUseCase)
    private _getOrgInvoicesUC: IGetOrgInvoicesUseCase,
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
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const orgId = req.user?.orgId;
      if (!orgId) {
        throw new ValidationError("No organization associated with user.");
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this._getOrgInvoicesUC.execute(
        orgId,
        page,
        limit,
        req.user!.id,
      );
      this.sendSuccess(
        res,
        result,
        "Organization invoices fetched successfully",
      );
    },
  );
}
