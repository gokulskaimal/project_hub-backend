import { z } from "zod";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { UserRole } from "../../domain/enums/UserRole";

// Task Priorities and Types must strictly match application ENUMs
export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const TASK_TYPES = ["STORY", "BUG", "TASK"] as const;
export const TASK_STATUS = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BACKLOG",
] as const;

export const TaskCreateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "Invalid priority level" }),
  }),
  type: z.enum(TASK_TYPES, {
    errorMap: () => ({ message: "Invalid task type" }),
  }),
  storyPoints: z.number().min(0).optional(),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid due date")
    .optional(),
  assignedTo: z.string().optional(),
  parentTaskId: z.string().optional(),
});

export const TaskUpdateSchema = TaskCreateSchema.partial().extend({
  status: z.enum(TASK_STATUS).optional(),
  sprintId: z.string().nullable().optional(),
  attachments: z.array(z.string().url()).optional(),
  comments: z.array(z.any()).optional(),
  parentTaskId: z.string().optional(),
});

export const SprintCreateSchema = z
  .object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(3, "Sprint name must be at least 3 characters"),
    description: z.string().optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
    goal: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

// Organization Validation
export const OrgCreateSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  description: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

export const OrgUpdateSchema = OrgCreateSchema.partial().extend({
  status: z.nativeEnum(OrganizationStatus).optional(),
});

// Invite Validation
export const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  orgId: z.string().min(1, "Organization ID is required"),
  role: z.nativeEnum(UserRole).optional(),
});

export const BulkInviteSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one email is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  role: z.nativeEnum(UserRole).optional(),
});

// Project Validation
export const ProjectCreateSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start date")
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid end date")
    .transform((val) => new Date(val))
    .optional(),
  priority: z
    .enum(PRIORITY_LEVELS, {
      errorMap: () => ({ message: "Invalid priority level" }),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  teamMemberIds: z.array(z.string()).optional(),
});

export const ProjectUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .optional(),
  description: z.string().optional(),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start date")
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid end date")
    .transform((val) => new Date(val))
    .optional(),
  priority: z
    .enum(PRIORITY_LEVELS, {
      errorMap: () => ({ message: "Invalid priority level" }),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  teamMemberIds: z.array(z.string()).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

// User Validation
export const UserUpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmNewPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const DeleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "Must type 'DELETE' to confirm" }),
  }),
});
