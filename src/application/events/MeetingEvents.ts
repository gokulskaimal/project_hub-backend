import { Meeting } from "../../domain/entities/Meeting";

export interface MeetingCreatedPayload {
  meeting: Meeting;
  creatorId: string;
}

export interface MeetingUpdatedPayload {
  meeting: Meeting;
}

export interface MeetingDeletedPayload {
  roomId: string;
  projectId: string;
}

export const MEETING_EVENTS = {
  CREATED: "meeting:created",
  UPDATED: "meeting:updated",
  DELETED: "meeting:deleted",
  COMPLETED: "meeting:completed",
} as const;
