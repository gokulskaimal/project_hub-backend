export interface IMarkNotificationReadUseCase {
  execute(notificationId: string): Promise<void>;
}
