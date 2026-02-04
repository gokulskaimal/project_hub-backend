export interface IMarkAllNotificationsReadUseCase {
  execute(userId: string): Promise<void>;
}
