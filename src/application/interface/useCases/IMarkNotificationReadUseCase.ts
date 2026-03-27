export interface IMarkNotificationReadUseCase {
  execute(notificationId: string, userId: string): Promise<void>;
}
