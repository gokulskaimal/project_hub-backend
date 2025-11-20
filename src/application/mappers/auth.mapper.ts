import { Request } from "express";
import {
  LoginRequestDTO,
  SendOtpRequestDTO,
  VerifyOtpRequestDTO,
  CompleteSignupRequestDTO,
  ResetRequestDTO,
  ResetPasswordDTO,
} from "../dto/auth.dto";

const safeString = (v: unknown): string =>
  typeof v == "string" ? v.trim() : String(v ?? "");

export const toLoginDTO = (req: Request): LoginRequestDTO => ({
  email: safeString(req.body?.email || "").trim(),
  password: safeString(req.body?.password || ""),
});

export const toSendOtpDTO = (req: Request): SendOtpRequestDTO => ({
  email: safeString(req.body?.email),
});

export const toVerifyOtpDTO = (req: Request): VerifyOtpRequestDTO => ({
  email: safeString(req.body?.email),
  otp: safeString(req.body?.otp),
});

export const toCompleteSignupDTO = (
  req: Request,
): CompleteSignupRequestDTO => ({
  email: safeString(req.body?.email),
  firstName: safeString(req.body?.firstName),
  lastName: safeString(req.body?.lastName),
  password: safeString(req.body?.password),
});

export const toResetRequestDTO = (req: Request): ResetRequestDTO => ({
  email: safeString(req.body?.email),
});

export const toResetPasswordDTO = (req: Request): ResetPasswordDTO => ({
  token: safeString(req.body?.token),
  password: safeString(req.body?.password),
});
