import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IOrganizationQueryUseCase } from "../interface/useCases/IOrganizationQueryUseCase";
import { Organization } from "../../domain/entities/Organization";

@injectable()
export class OrganizationQueryUseCase implements IOrganizationQueryUseCase {
  constructor(@inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo) {}

  async listOrganizations(
    limit: number,
    offset: number,
    search?: string,
  ): Promise<{ organizations: Organization[]; total: number }> {
    return this._orgRepo.findPaginated(limit, offset, search || "");
  }

  async getOrganizationById(orgId: string): Promise<Organization | null> {
    return this._orgRepo.findById(orgId);
  }
}
