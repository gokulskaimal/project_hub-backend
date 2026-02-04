export interface ICreateNotificationUseCase {
  execute(
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    link?: string,
  ): Promise<void>;
}
