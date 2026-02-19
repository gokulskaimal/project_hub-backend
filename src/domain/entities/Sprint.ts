export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  goal?: string;
  createdAt: Date;
  updatedAt: Date;
}
