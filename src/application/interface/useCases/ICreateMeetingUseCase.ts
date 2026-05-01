import { Meeting } from "../../../domain/entities/Meeting";

export interface ICreateMeetingUseCase {
  execute(
    data: {
      sprintId: string;
      projectId: string;
      title: string;
      type: string;
      scheduledAt: string;
    },
    creatorId: string,
  ): Promise<Meeting>;
}
