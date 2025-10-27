"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inversify_1 = require("inversify");
/**
 * Email Service Implementation
 * Provides email sending capabilities using NodeMailer
 */
let EmailService = class EmailService {
    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT) || 587;
        const secure = process.env.SMTP_SECURE?.toLowerCase() === 'true' || port === 465;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
        if (!host || !user || !pass) {
            throw new Error('Email service is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
        }
        this.transporter = nodemailer_1.default.createTransport({
            host,
            port,
            secure,
            auth: { user, pass }
        });
    }
    renderTemplate(templateName, variables) {
        try {
            const filePath = path_1.default.join(__dirname, 'templates', templateName);
            const html = fs_1.default.readFileSync(filePath, 'utf-8');
            return Object.entries(variables).reduce((acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value), html);
        }
        catch {
            return null;
        }
    }
    async sendEmail(payload) {
        try {
            await this.transporter.sendMail({
                from: process.env.FROM_EMAIL ?? '"Project Hub" <projecthub.new@gmail.com>',
                to: payload.to,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
            });
            console.log(`✅ Email sent to ${payload.to}: ${payload.subject}`);
        }
        catch (err) {
            console.error('❌ Error sending email:', err);
            throw new Error(`Could not send email: ${err.message}`);
        }
    }
    async sendWelcomeEmail(email, name, verificationCode) {
        const variables = {
            NAME: name,
            VERIFICATION_CODE: verificationCode || '',
            BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
        };
        const html = this.renderTemplate('welcome.html', variables);
        await this.sendEmail({
            to: email,
            subject: 'Welcome to Project Hub! 🎉',
            text: `Welcome ${name}! Thank you for joining Project Hub.${verificationCode ? ` Your verification code is: ${verificationCode}` : ''}`,
            html: html ?? undefined,
        });
    }
    async sendResetPasswordEmail(email, resetToken) {
        const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        const variables = {
            RESET_URL: resetUrl,
            RESET_TOKEN: resetToken,
            EXPIRY_TIME: '1 hour',
        };
        const html = this.renderTemplate('reset-password.html', variables);
        await this.sendEmail({
            to: email,
            subject: 'Reset Your Password - Project Hub',
            text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
            html: html ?? undefined,
        });
    }
    async sendInviteEmail(email, inviteToken, orgName, inviterName) {
        const inviteUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;
        const variables = {
            INVITE_URL: inviteUrl,
            TOKEN: inviteToken,
            ORG_NAME: orgName,
            INVITER_NAME: inviterName,
            EXPIRY: '7 days',
        };
        const html = this.renderTemplate('inviteMember.html', variables);
        await this.sendEmail({
            to: email,
            subject: `You're invited to join ${orgName} on Project Hub!`,
            text: `${inviterName} has invited you to join ${orgName}. Click this link to accept: ${inviteUrl}\n\nThis invitation expires in 7 days.`,
            html: html ?? undefined,
        });
    }
    async sendOtpEmail(email, otp, purpose = 'verification') {
        const variables = {
            OTP: otp,
            PURPOSE: purpose,
            EXPIRY_TIME: '10 minutes',
        };
        const html = this.renderTemplate('otp.html', variables);
        await this.sendEmail({
            to: email,
            subject: `Your OTP Code - Project Hub`,
            text: `Your OTP code for ${purpose} is: ${otp}\n\nThis code expires in 10 minutes.`,
            html: html ?? undefined,
        });
    }
    async sendVerificationEmail(email, name, verificationCode) {
        const verifyUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?code=${verificationCode}`;
        const variables = {
            NAME: name,
            VERIFICATION_CODE: verificationCode,
            VERIFY_URL: verifyUrl,
        };
        const html = this.renderTemplate('email-verification.html', variables);
        await this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address - Project Hub',
            text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verifyUrl}\n\nOr use this verification code: ${verificationCode}`,
            html: html ?? undefined,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=EmailService.js.map