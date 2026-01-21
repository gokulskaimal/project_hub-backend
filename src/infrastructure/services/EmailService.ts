import nodemailer, { Transporter } from "nodemailer";
import fs from "fs";
import path from "path";
import { injectable, inject } from "inversify";
import { IEmailService } from "../interface/services/IEmailService";
import { TYPES } from "../container/types";
import { ILogger } from "../interface/services/ILogger";

/**
 * Email Service Implementation
 * Provides email sending capabilities using NodeMailer
 */
@injectable()
export class EmailService implements IEmailService {
  private transporter: Transporter;

  constructor(@inject(TYPES.ILogger) private readonly _logger: ILogger) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure =
      process.env.SMTP_SECURE?.toLowerCase() === "true" || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this._logger.warn(
        "Email service is not configured. Falling back to JSON transport for development.",
      );
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  private renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): string | null {
    try {
      const filePath = path.join(__dirname, "templates", templateName);
      const html = fs.readFileSync(filePath, "utf-8");
      return Object.entries(variables).reduce(
        (acc, [key, value]) =>
          acc.replace(new RegExp(`{{${key}}}`, "g"), value),
        html,
      );
    } catch {
      return null;
    }
  }

  async sendEmail(payload: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:
          process.env.FROM_EMAIL ?? '"Project Hub" <projecthub.new@gmail.com>',
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
      this._logger.info(`Email sent to ${payload.to}`);
      if (process.env.NODE_ENV !== "production" && payload.text) {
        this._logger.debug(payload.text);
      }
    } catch (err: unknown) {
      this._logger.error("❌ Error sending email", err as Error);
      throw new Error(`Could not send email: ${(err as Error).message}`);
    }
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
    verificationCode?: string,
  ): Promise<void> {
    const variables = {
      NAME: name,
      VERIFICATION_CODE: verificationCode || "",
      BASE_URL: process.env.BASE_URL || "http://localhost:3000",
    };

    const html = this.renderTemplate("welcome.html", variables);

    await this.sendEmail({
      to: email,
      subject: "Welcome to Project Hub! 🎉",
      text: `Welcome ${name}! Thank you for joining Project Hub.${verificationCode ? ` Your verification code is: ${verificationCode}` : ""}`,
      html: html ?? undefined,
    });
  }

  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${process.env.BASE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const variables = {
      RESET_URL: resetUrl,
      RESET_TOKEN: resetToken,
      EXPIRY_TIME: "1 hour",
    };

    const html = this.renderTemplate("reset-password.html", variables);

    await this.sendEmail({
      to: email,
      subject: "Reset Your Password - Project Hub",
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      html: html ?? undefined,
    });
  }

  async sendInviteEmail(
    email: string,
    inviteToken: string,
    orgName: string,
    inviterName: string,
  ): Promise<void> {
    const inviteUrl = `${process.env.BASE_URL || "http://localhost:3000"}/accept-invite?token=${inviteToken}`;

    const variables = {
      INVITE_URL: inviteUrl,
      TOKEN: inviteToken,
      ORG_NAME: orgName,
      INVITER_NAME: inviterName,
      EXPIRY: "7 days",
    };

    const html = this.renderTemplate("inviteMember.html", variables);

    const text = `${inviterName} has invited you to join ${orgName}. Click this link to accept: ${inviteUrl}\n\nThis invitation expires in 7 days.`;

    // [TESTING-ONLY] Write to file for automated verification
    if (process.env.NODE_ENV !== "production") {
      try {
        // Hardcoded path to artifacts dir for reliability in this specific env
        const tempPath =
          "c:/Users/gokul/.gemini/antigravity/brain/5dd41adf-753e-4b17-9d06-9543aaf15df8/temp_invite_link.txt";
        fs.writeFileSync(tempPath, inviteUrl);
        this._logger.info(`[Testing] Invite link written to ${tempPath}`);
      } catch (error) {
        this._logger.error(
          "[Testing] Failed to write invite link to file",
          error as Error,
        );
      }
    }

    await this.sendEmail({
      to: email,
      subject: `You're invited to join ${orgName} on Project Hub!`,
      text: text,
      html: html ?? undefined,
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    purpose: string = "verification",
  ): Promise<void> {
    const variables = {
      OTP: otp,
      PURPOSE: purpose,
      EXPIRY_TIME: "10 minutes",
    };

    const html = this.renderTemplate("otp.html", variables);

    // [TESTING-ONLY] Write to file for automated verification
    if (process.env.NODE_ENV !== "production") {
      try {
        // Hardcoded path to artifacts dir
        const tempPath =
          "c:/Users/gokul/.gemini/antigravity/brain/5dd41adf-753e-4b17-9d06-9543aaf15df8/temp_otp.txt";
        fs.writeFileSync(tempPath, otp);
        this._logger.info(`[Testing] OTP written to ${tempPath}`);
      } catch (error) {
        this._logger.error(
          "[Testing] Failed to write OTP to file",
          error as Error,
        );
      }
    }

    await this.sendEmail({
      to: email,
      subject: `Your OTP Code - Project Hub`,
      text: `Your OTP code for ${purpose} is: ${otp}\n\nThis code expires in 10 minutes.`,
      html: html ?? undefined,
    });
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    verificationCode: string,
  ): Promise<void> {
    const verifyUrl = `${process.env.BASE_URL || "http://localhost:3000"}/verify-email?code=${verificationCode}`;

    const variables = {
      NAME: name,
      VERIFICATION_CODE: verificationCode,
      VERIFY_URL: verifyUrl,
    };

    const html = this.renderTemplate("email-verification.html", variables);

    await this.sendEmail({
      to: email,
      subject: "Verify Your Email Address - Project Hub",
      text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verifyUrl}\n\nOr use this verification code: ${verificationCode}`,
      html: html ?? undefined,
    });
  }
}
