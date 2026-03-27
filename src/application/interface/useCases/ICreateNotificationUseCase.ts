export interface ICreateNotificationUseCase {
  execute(
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    orgId: string,
    link?: string,
  ): Promise<void>;
}
