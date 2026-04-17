export interface IEventDispatcher {
  dispatch(eventName: string, data: unknown): void;
}
