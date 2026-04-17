import { z } from "zod";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { UserRole } from "../../domain/enums/UserRole";

// Task Priorities and Types must strictly match application ENUMs
export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const TASK_TYPES = ["STORY", "BUG", "TASK", "EPIC"] as const;
export const STORY_POINTS = [0, 1, 2, 3, 5, 8, 13] as const;
export const TASK_STATUS = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "BACKLOG",
] as const;

export const TaskBaseSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().nullable().optional(),
  priority: z.enum(PRIORITY_LEVELS, {
    errorMap: () => ({ message: "Invalid priority level" }),
  }),
  type: z.enum(TASK_TYPES, {
    errorMap: () => ({ message: "Invalid task type" }),
  }),
  epicId: z.string().nullable().optional(),
  storyPoints: z
    .number()
    .int()
    .refine((v) => STORY_POINTS.includes(v as (typeof STORY_POINTS)[number]), {
      message: "Story points must be one of 0,1,2,3,5,8,13",
    })
    .nullable()
    .optional(),
  assignedTo: z.string().nullable().optional(),
  parentTaskId: z.string().nullable().optional(),
  dueDate: z
    .preprocess((val) => (val === "" ? undefined : val), z.string().optional())
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid due date")
    .optional(),
  acceptanceCriteria: z
    .array(
      z.object({
        text: z.string().min(1, "Criteria text required"),
        completed: z.boolean().default(false),
      }),
    )
    .optional(),
});

export const TaskCreateSchema = TaskBaseSchema.refine(
  (data) => {
    if (
      data.type === "STORY" &&
      (data.storyPoints === undefined ||
        data.storyPoints === null ||
        data.storyPoints === 0)
    ) {
      return false;
    }
    return true;
  },
  {
    message: "User Stories must have story points assigned (> 0)",
    path: ["storyPoints"],
  },
);

export const TaskUpdateSchema = TaskBaseSchema.partial()
  .extend({
    status: z.enum(TASK_STATUS).optional(),
    sprintId: z.string().nullable().optional(),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          size: z.number().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
    comments: z.array(z.any()).optional(),
    parentTaskId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.type === "STORY" &&
        (data.storyPoints === undefined ||
          data.storyPoints === null ||
          data.storyPoints === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "User Stories must have story points assigned (> 0)",
      path: ["storyPoints"],
    },
  );

export const TaskCommentCreateSchema = z.object({
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(1000, "Comment is too long"),
});

export const SprintCreateSchema = z
  .object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(3, "Sprint name must be at least 3 characters"),
    description: z.string().nullable().optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
    goal: z.string().nullable().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

export const SprintUpdateSchema = z
  .object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(3, "Sprint name must be at least 3 characters"),
    description: z.string().nullable().optional(),
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid start date"),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), "Invalid end date"),
    goal: z.string().nullable().optional(),
    status: z
      .enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED", "PLANNING"])
      .optional(),
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
  expiresIn: z.number().min(1).max(365).optional(),
});

export const BulkInviteSchema = z.object({
  emails: z
    .array(z.string().email("Invalid email address"))
    .min(1, "At least one email is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  role: z.nativeEnum(UserRole).optional(),
  expiresIn: z.number().min(1).max(365).optional(),
});

export const AcceptInviteSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Project Validation
export const ProjectCreateSchema = z
  .object({
    name: z.string().min(3, "Project name must be at least 3 characters"),
    description: z.string().optional(),
    startDate: z
      .preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().optional(),
      )
      .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid start date")
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().optional(),
      )
      .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid end date")
      .transform((val) => (val ? new Date(val) : undefined)),
    priority: z
      .enum(PRIORITY_LEVELS, {
        errorMap: () => ({ message: "Invalid priority level" }),
      })
      .optional(),
    tasksPerWeek: z
      .number()
      .int()
      .min(1, "Tasks per week must be at least 1")
      .max(1000, "Tasks per week is too large")
      .optional(),
    tags: z.array(z.string()).optional(),
    teamMemberIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );

export const ProjectUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, "Project name must be at least 3 characters")
      .optional(),
    description: z.string().optional(),
    startDate: z
      .preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().optional(),
      )
      .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid start date")
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().optional(),
      )
      .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid end date")
      .transform((val) => (val ? new Date(val) : undefined)),
    priority: z
      .enum(PRIORITY_LEVELS, {
        errorMap: () => ({ message: "Invalid priority level" }),
      })
      .optional(),
    tasksPerWeek: z
      .number()
      .int()
      .min(1, "Tasks per week must be at least 1")
      .max(1000, "Tasks per week is too large")
      .optional(),
    tags: z.array(z.string()).optional(),
    teamMemberIds: z.array(z.string()).optional(),
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );

// User Validation
export const UserUpdateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").nullable().optional(),
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
// Plan Validation
export const PlanCreateSchema = z.object({
  name: z.string().min(3, "Plan name must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  currency: z.string().default("INR"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  duration: z
    .number()
    .int()
    .positive("Duration must be at least 1 day")
    .optional(),
  type: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  isActive: z.boolean().default(true),
  limits: z.object({
    projects: z.number().int().min(1, "Must allow at least 1 project"),
    members: z.number().int().min(1, "Must allow at least 1 member"),
    storage: z.number().int().optional(),
    messages: z.number().int().optional(),
  }),
});

export const PlanUpdateSchema = PlanCreateSchema.partial();
