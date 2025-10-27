export interface LoginRequestDTO {
  email: string;
  password: string;
}
export interface SendOtpRequestDTO {
  email: string;
}
export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
}
export interface CompleteSignupRequestDTO {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
export interface ResetRequestDTO {
  email: string;
}
export interface ResetPasswordDTO {
  token: string;
  password: string;
}
