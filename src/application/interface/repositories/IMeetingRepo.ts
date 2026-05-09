import { Meeting } from "../../../domain/entities/Meeting";
import { IBaseRepository } from "./IBaseRepo";

export interface IMeetingRepo extends IBaseRepository<Meeting> {
  findBySprint(sprintId: string): Promise<Meeting[]>;
  findByRoomId(roomId: string): Promise<Meeting | null>;
  create(meeting: Partial<Meeting>): Promise<Meeting>;
  updateStatus(roomId: string, status: string): Promise<Meeting | null>;
  updateByRoomId(
    roomId: string,
    data: Partial<Meeting>,
  ): Promise<Meeting | null>;
  deleteByRoomId(roomId: string): Promise<boolean>;
  findPaginatedByProjectIds(
    projectIds: string[],
    limit: number,
    offset: number,
    status?: "SCHEDULED" | "HISTORY",
  ): Promise<{ meetings: Meeting[]; total: number }>;
}
