export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    public readonly link: string,
    public readonly isRead: boolean,
    public readonly createdAt: Date,
  ) {}
}
