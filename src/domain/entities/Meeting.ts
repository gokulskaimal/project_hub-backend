export interface Meeting {
  id: string;
  sprintId: string;
  projectId: string;
  title: string;
  type: "STANDUP" | "REVIEW" | "RETROSPECTIVE";
  roomId: string; // Unique ID for Zego Room
  scheduledAt: Date;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date | null;
}
