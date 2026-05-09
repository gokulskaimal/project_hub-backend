import { Meeting } from "../../../domain/entities/Meeting";

export interface IUpdateMeetingUseCase {
  execute(roomId: string, data: Partial<Meeting>): Promise<Meeting>;
}
