import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IMeetingRepo } from "../interface/repositories/IMeetingRepo";
import { IProjectRepo } from "../interface/repositories/IProjectRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { IGetMyMeetingsUseCase } from "../interface/useCases/IGetMyMeetingsUseCase";
import { Meeting } from "../../domain/entities/Meeting";

@injectable()
export class GetMyMeetingsUseCase implements IGetMyMeetingsUseCase {
  constructor(
    @inject(TYPES.IMeetingRepo) private _meetingRepo: IMeetingRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
  ) {}

  async execute(params: {
    userId: string;
    role: string;
    orgId: string;
    page: number;
    limit: number;
    status?: "SCHEDULED" | "HISTORY";
  }): Promise<{ items: Meeting[]; total: number; totalPages: number }> {
    const { userId, role, orgId, page, limit, status } = params;
    const offset = (page - 1) * limit;
    const projects =
      role === UserRole.ORG_MANAGER || role === UserRole.SUPER_ADMIN
        ? await this._projectRepo.findByOrg(orgId)
        : await this._projectRepo.findByTeamMember(userId, orgId);

    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) return { items: [], total: 0, totalPages: 0 };

    const { meetings, total } =
      await this._meetingRepo.findPaginatedByProjectIds(
        projectIds,
        limit,
        offset,
        status,
      );
    return { items: meetings, total, totalPages: Math.ceil(total / limit) };
  }
}
