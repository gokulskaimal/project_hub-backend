import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IOrganizationQueryUseCase } from "../interface/useCases/IOrganizationQueryUseCase";
import { Organization } from "../../domain/entities/Organization";

@injectable()
export class OrganizationQueryUseCase implements IOrganizationQueryUseCase {
  constructor(@inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo) {}

  async listOrganizations(
    limit: number,
    offset: number,
    search?: string,
    status?: string,
  ): Promise<{ organizations: Organization[]; total: number }> {
    return this._orgRepo.findPaginated(limit, offset, search || "", status);
  }

  async getOrganizationById(orgId: string): Promise<Organization | null> {
    return this._orgRepo.findById(orgId);
  }
}
