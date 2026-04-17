import EventEmitter from "events";
import { inject, injectable } from "inversify";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { TYPES } from "../container/types";
import { ILogger } from "../../application/interface/services/ILogger";

@injectable()
export class EventDispatcher implements IEventDispatcher {
  private _emitter: EventEmitter;
  constructor(@inject(TYPES.ILogger) private readonly _logger: ILogger) {
    this._emitter = new EventEmitter();
  }

  dispatch(eventName: string, data: unknown): void {
    this._logger.info(
      `Dispatching event ${eventName}`,
      data as Record<string, unknown>,
    );
    this._emitter.emit(eventName, data);
  }

  on(eventName: string, listener: (data: unknown) => void): void {
    this._emitter.on(eventName, listener);
  }
}
