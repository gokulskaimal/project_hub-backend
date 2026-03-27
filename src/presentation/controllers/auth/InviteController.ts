import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../infrastructure/container/types";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IAcceptUseCase } from "../../../application/interface/useCases/IAcceptUseCase";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../../utils/asyncHandler";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";

@injectable()
export class InviteController {
  constructor(
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IInviteMemberUseCase)
    private readonly _inviteMemberUC: IInviteMemberUseCase,
    @inject(TYPES.IAcceptUseCase) private readonly _acceptUC: IAcceptUseCase,
  ) {}

  private sendSuccess(
    res: Response,
    data: unknown,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ) {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  inviteMember = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { email, orgId, role, expiresIn } = req.body;
    this._logger.info("Inviting member", { email, orgId, role, expiresIn });
    const result = await this._inviteMemberUC.execute(
      email,
      orgId,
      authReq.user!.id,
      role,
      expiresIn,
    );
    this.sendSuccess(
      res,
      result,
      COMMON_MESSAGES.INVITATION_SENT,
      StatusCodes.CREATED,
    );
  });

  acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const { token, password, firstName, lastName } = req.body;
    this._logger.info("Accepting invite", {
      token: "REDACTED",
      firstName,
      lastName,
    });
    const result = await this._acceptUC.execute(
      token,
      password,
      firstName,
      lastName,
    );
    this.sendSuccess(res, result, COMMON_MESSAGES.ACCEPTED);
  });

  validateInviteToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    this._logger.info("Validating invite token", { token: "REDACTED" });
    const result = await this._acceptUC.validateInvitationToken(token);
    this.sendSuccess(res, result, "Token validation result");
  });
}
