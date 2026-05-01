import { Meeting } from "../../../domain/entities/Meeting";

export interface IGetSprintMeetingUseCase {
  execute(sprintId: string): Promise<Meeting[]>;
}
