import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IGetOrgInvoicesUseCase } from "../../../application/interface/useCases/IGetOrgInvoicesUseCase";
import { IManagerInvoiceController } from "../../interfaces/controllers/IManagerInvoiceController";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../middleware/ErrorMiddleware";

@injectable()
export class ManagerInvoiceController implements IManagerInvoiceController {
  constructor(
    @inject(TYPES.IGetOrgInvoicesUseCase)
    private _getOrgInvoicesUC: IGetOrgInvoicesUseCase,
  ) {}

  getInvoices = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const orgId = req.user?.orgId;
      if (!orgId) {
        return ResponseHandler.validationError(
          res,
          "No organization associated with user.",
        );
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this._getOrgInvoicesUC.execute(
        orgId,
        page,
        limit,
        req.user!.id,
      );
      ResponseHandler.success(
        res,
        result,
        "Organization invoices fetched successfully",
      );
    },
  );
}
