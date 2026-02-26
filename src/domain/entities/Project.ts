export interface Project {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  startDate?: Date;
  endDate: Date;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  tags?: string[];
  teamMemberIds?: string[];
  taskSequence?: number;
  key?: string;
  createdAt: Date;
  updatedAt: Date;
}
