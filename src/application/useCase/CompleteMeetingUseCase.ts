import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IMeetingRepo } from "../interface/repositories/IMeetingRepo";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { MEETING_EVENTS } from "../events/MeetingEvents";
import { Meeting } from "../../domain/entities/Meeting";
import { ICompleteMeetingUseCase } from "../interface/useCases/ICompleteMeetingUseCase";

@injectable()
export class CompleteMeetingUseCase implements ICompleteMeetingUseCase {
  constructor(
    @inject(TYPES.IMeetingRepo) private _meetingRepo: IMeetingRepo,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(roomId: string): Promise<Meeting> {
    const meeting = await this._meetingRepo.updateStatus(roomId, "COMPLETED");
    if (!meeting) throw new Error("Meeting not found");

    await this._eventDispatcher.dispatch(MEETING_EVENTS.COMPLETED, { meeting });

    return meeting;
  }
}
