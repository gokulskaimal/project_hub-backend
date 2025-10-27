import { Request } from "express";
import {
  LoginRequestDTO,
  SendOtpRequestDTO,
  VerifyOtpRequestDTO,
  CompleteSignupRequestDTO,
  ResetRequestDTO,
  ResetPasswordDTO,
} from "../dto/auth.dto";

export const toLoginDTO = (req: Request): LoginRequestDTO => ({
  email: String(req.body?.email || "").trim(),
  password: String(req.body?.password || ""),
});

export const toSendOtpDTO = (req: Request): SendOtpRequestDTO => ({
  email: String(req.body?.email || "").trim(),
});

export const toVerifyOtpDTO = (req: Request): VerifyOtpRequestDTO => ({
  email: String(req.body?.email || "").trim(),
  otp: String(req.body?.otp || "").trim(),
});

export const toCompleteSignupDTO = (
  req: Request,
): CompleteSignupRequestDTO => ({
  email: String(req.body?.email || "").trim(),
  firstName: String(req.body?.firstName || "").trim(),
  lastName: String(req.body?.lastName || "").trim(),
  password: String(req.body?.password || ""),
});

export const toResetRequestDTO = (req: Request): ResetRequestDTO => ({
  email: String(req.body?.email || "").trim(),
});

export const toResetPasswordDTO = (req: Request): ResetPasswordDTO => ({
  token: String(req.body?.token || "").trim(),
  password: String(req.body?.password || ""),
});
