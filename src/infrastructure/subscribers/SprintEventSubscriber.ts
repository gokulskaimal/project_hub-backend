import { inject, injectable } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ILogger } from "../../application/interface/services/ILogger";
import {
  SPRINT_EVENTS,
  SprintCreatedPayload,
  SprintUpdatedPayload,
  SprintDeletedPayload,
} from "../../application/events/SprintEvents";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";
import { EventDispatcher } from "../services/EventDispatcher";

@injectable()
export class SprintEventSubscriber implements IEventSubscriber {
  constructor(
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(
        SPRINT_EVENTS.CREATED,
        this.handleSprintCreated.bind(this),
      );
      this._eventDispatcher.on(
        SPRINT_EVENTS.UPDATED,
        this.handleSprintUpdated.bind(this),
      );
      this._eventDispatcher.on(
        SPRINT_EVENTS.DELETED,
        this.handleSprintDeleted.bind(this),
      );
      this._logger.info("SprintEventSubscriber: Listeners initialized.");
    }
  }

  private async handleSprintCreated(
    payload: SprintCreatedPayload,
  ): Promise<void> {
    const { sprint } = payload;
    this._socketService.emitToProject(
      sprint.projectId,
      "sprint:created",
      sprint,
    );
  }

  private async handleSprintUpdated(
    payload: SprintUpdatedPayload,
  ): Promise<void> {
    const { updatedSprint } = payload;
    this._socketService.emitToProject(
      updatedSprint.projectId,
      "sprint:updated",
      updatedSprint,
    );
  }

  private async handleSprintDeleted(
    payload: SprintDeletedPayload,
  ): Promise<void> {
    const { sprintId, projectId } = payload;
    this._socketService.emitToProject(projectId, "sprint:deleted", sprintId);
  }
}
