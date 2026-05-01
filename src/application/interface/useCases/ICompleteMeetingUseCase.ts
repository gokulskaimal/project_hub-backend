import { Meeting } from "../../../domain/entities/Meeting";

export interface ICompleteMeetingUseCase {
  execute(roomId: string): Promise<Meeting>;
}
