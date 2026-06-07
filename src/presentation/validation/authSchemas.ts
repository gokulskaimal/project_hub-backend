import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().trim().min(8).max(128),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  }),
});

export const completeSignupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .trim()
      .min(8)
      .max(128)
      .refine((val) => /[a-z]/.test(val), "Must contain lowercase")
      .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
      .refine((val) => /\d/.test(val), "Must contain number")
      .refine(
        (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Must contain special char",
      ),
    firstName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/[a-zA-Z]/, "First name must contain at least one letter"),
    lastName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/[a-zA-Z]/, "Last name must contain at least one letter"),
    additionalData: z.record(z.unknown()).optional(),
    signupToken: z.string().min(1, "Security token is required"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    organizationName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(
        /[a-zA-Z0-9]/,
        "Organization name must contain at least one letter or number",
      ),
  }),
});
