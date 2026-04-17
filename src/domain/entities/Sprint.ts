export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "PLANNING";
  goal?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
