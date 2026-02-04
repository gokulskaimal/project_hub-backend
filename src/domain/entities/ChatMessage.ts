export class ChatMessage {
  constructor(
    public id: string,
    public projectId: string,
    public senderId: string,
    public content: string,
    public type: "TEXT" | "FILE" | "IMAGE",
    public fileUrl: string | null,
    public createdAt: Date,
    public senderName?: string, // Populated field
  ) {}
}
