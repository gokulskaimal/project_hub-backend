import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IMeetingRepo } from "../interface/repositories/IMeetingRepo";
import { Meeting } from "../../domain/entities/Meeting";
import { IGetSprintMeetingUseCase } from "../interface/useCases/IGetSprintMeetingUseCase";

@injectable()
export class GetSprintMeetingUseCase implements IGetSprintMeetingUseCase {
  constructor(@inject(TYPES.IMeetingRepo) private _meetingRepo: IMeetingRepo) {}

  async execute(sprintId: string): Promise<Meeting[]> {
    return await this._meetingRepo.findBySprint(sprintId);
  }
}
