import { Meeting } from "../../../domain/entities/Meeting";

export interface IGetMyMeetingsUseCase {
  execute(params: {
    userId: string;
    role: string;
    orgId: string;
    page: number;
    limit: number;
    status?: "SCHEDULED" | "HISTORY";
  }): Promise<{ items: Meeting[]; total: number; totalPages: number }>;
}
