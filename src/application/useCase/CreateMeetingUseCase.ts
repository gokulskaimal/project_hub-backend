import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IMeetingRepo } from "../interface/repositories/IMeetingRepo";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { MEETING_EVENTS } from "../events/MeetingEvents";
import { Meeting } from "../../domain/entities/Meeting";
import { ICreateMeetingUseCase } from "../interface/useCases/ICreateMeetingUseCase";

@injectable()
export class CreateMeetingUseCase implements ICreateMeetingUseCase {
  constructor(
    @inject(TYPES.IMeetingRepo) private _meetingRepo: IMeetingRepo,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    data: {
      sprintId: string;
      projectId: string;
      title: string;
      type: string;
      scheduledAt: string;
    },
    creatorId: string,
  ): Promise<Meeting> {
    const roomId = `${data.sprintId}-${data.type.toLowerCase()}-${Date.now()}`;
    const meetingData = {
      ...data,
      roomId,
      scheduledAt: new Date(data.scheduledAt),
      status: "SCHEDULED" as const,
    };
    const meeting = await this._meetingRepo.create(
      meetingData as unknown as Meeting,
    );
    await this._eventDispatcher.dispatch(MEETING_EVENTS.CREATED, {
      meeting,
      creatorId,
    });

    return meeting;
  }
}
