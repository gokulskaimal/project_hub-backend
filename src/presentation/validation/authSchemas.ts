import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
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
      .min(8)
      .max(128)
      .refine((val) => /[a-z]/.test(val), "Must contain lowercase")
      .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
      .refine((val) => /\d/.test(val), "Must contain number")
      .refine(
        (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Must contain special char",
      ),
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    additionalData: z.record(z.any()).optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    organizationName: z.string().min(2).max(100),
  }),
});
