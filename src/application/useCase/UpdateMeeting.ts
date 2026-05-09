import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IMeetingRepo } from "../interface/repositories/IMeetingRepo";
import { Meeting } from "../../domain/entities/Meeting";
import { MEETING_EVENTS } from "../events/MeetingEvents";
import { IUpdateMeetingUseCase } from "../interface/useCases/IUpdateMeetingUseCase";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";

@injectable()
export class UpdateMeetingUseCase implements IUpdateMeetingUseCase {
  constructor(
    @inject(TYPES.IMeetingRepo) private _meetingRepo: IMeetingRepo,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(roomId: string, data: Partial<Meeting>): Promise<Meeting> {
    const meeting = await this._meetingRepo.updateByRoomId(roomId, data);
    if (!meeting) throw new Error("Meeting not Found");

    await this._eventDispatcher.dispatch(MEETING_EVENTS.UPDATED, { meeting });
    return meeting;
  }
}
