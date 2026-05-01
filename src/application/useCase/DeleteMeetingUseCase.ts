import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IMeetingRepo } from "../interface/repositories/IMeetingRepo";
import { IDeleteMeetingUseCase } from "../interface/useCases/IDeleteMeetingUseCase";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { MEETING_EVENTS } from "../events/MeetingEvents";

@injectable()
export class DeleteMeetingUseCase implements IDeleteMeetingUseCase {
  constructor(
    @inject(TYPES.IMeetingRepo) private _meetingRepo: IMeetingRepo,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(roomId: string): Promise<boolean> {
    const meeting = await this._meetingRepo.findByRoomId(roomId);

    if (!meeting) throw new Error("Meeting not found");

    const success = await this._meetingRepo.deleteByRoomId(roomId);
    if (!success) throw new Error("Failed to delete meeting");

    this._eventDispatcher.dispatch(MEETING_EVENTS.DELETED, {
      roomId: roomId,
      projectId: meeting.projectId,
    });
    return true;
  }
}
