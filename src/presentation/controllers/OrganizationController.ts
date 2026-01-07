import { Response, NextFunction } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IOrganizationManagementUseCase } from "../../application/interface/useCases/IOrganizationManagementUseCase";
import { IOrganizationQueryUseCase } from "../../application/interface/useCases/IOrganizationQueryUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { IUserQueryUseCase } from "../../application/interface/useCases/IUserQueryUseCase";

@injectable()
export class OrganizationController {
  constructor(
    @inject(TYPES.IOrganizationManagementUseCase)
    private _orgManagement: IOrganizationManagementUseCase,
    @inject(TYPES.IOrganizationQueryUseCase)
    private _orgQuery: IOrganizationQueryUseCase,
    @inject(TYPES.IUserQueryUseCase) private _userQuery: IUserQueryUseCase,
  ) {}

  async getMyOrganization(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        res.status(400).json({ error: "No Organization ID found in token" });
        return;
      }

      const org = await this._orgQuery.getOrganizationById(orgId);
      if (!org) {
        res.status(404).json({ error: "Organization not found" });
        return;
      }

      res.json(org);
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const orgId = req.user?.orgId;
      const { name } = req.body;

      if (!orgId) {
        res.status(400).json({ error: "No Organization ID found" });
        return;
      }

      const updated = await this._orgManagement.updateOrganization(orgId, {
        name,
      });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async getOrganizationUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        res.status(400).json({ error: "No Organization ID found" });
        return;
      }

      const users = await this._userQuery.getUsersByOrganization(orgId);
      res.json({ data: users }); // Consistent with existing API response wrappers if any, or just array
    } catch (error) {
      next(error);
    }
  }
}
