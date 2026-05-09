import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IAcceptUseCase } from "../../../application/interface/useCases/IAcceptUseCase";
import { ILogger } from "../../../application/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import {
  AcceptInviteSchema,
  InviteMemberSchema,
} from "../../../application/dto/ValidationSchemas";

@injectable()
export class InviteController {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IInviteMemberUseCase)
    private readonly _inviteMemberUC: IInviteMemberUseCase,
    @inject(TYPES.IAcceptUseCase) private readonly _acceptUC: IAcceptUseCase,
  ) {}

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const validation = InviteMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }
    const result = await this._inviteMemberUC.execute(
      validation.data.email,
      validation.data.orgId,
      authReq.user!.id,
      validation.data.role,
      validation.data.expiresIn,
    );
    ResponseHandler.success(
      res,
      result,
      COMMON_MESSAGES.INVITATION_SENT,
      StatusCodes.CREATED,
    );
  });

  acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const validation = AcceptInviteSchema.safeParse(req.body);

    if (!validation.success) {
      return ResponseHandler.validationError(res, validation.error.format());
    }
    this._logger.info("Accepting invite", {
      token: "REDACTED",
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
    });
    res.setHeader("Referrer-Policy", "no-referrer");
    const result = await this._acceptUC.execute(
      validation.data.token,
      validation.data.password,
      validation.data.firstName,
      validation.data.lastName,
    );
    ResponseHandler.success(res, result, COMMON_MESSAGES.ACCEPTED);
  });

  validateInviteToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    this._logger.info("Validating invite token", { token: "REDACTED" });
    res.setHeader("Referrer-Policy", "no-referrer");
    const result = await this._acceptUC.validateInvitationToken(token);
    ResponseHandler.success(res, result, "Token validation result");
  });
}
