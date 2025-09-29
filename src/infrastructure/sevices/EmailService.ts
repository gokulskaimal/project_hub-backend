// server/src/infrastructure/sevices/EmailService.ts
import nodemailer, { Transporter } from 'nodemailer'
import { EmailPayload, IEmailService } from '../../domain/interface/IEmailService'

export class EmailService implements IEmailService {
    private transporter: Transporter;

    constructor() {
        const host = process.env.SMTP_HOST
        const port = Number(process.env.SMTP_PORT) || 587
        const secure = process.env.SMTP_SECURE?.toLowerCase() === 'true' || port === 465
        const user = process.env.SMTP_USER
        const pass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS

        if (!host || !user || !pass) {
            throw new Error(
                'Email service is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.'
            )
        }

        this.transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
    }

    async sendEmail(payload: EmailPayload): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.FROM_EMAIL ?? '"Project Hub" <projecthub.new@gmail.com>',
                to: payload.to,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
            })
            console.log(`Email sent to ${payload.to}`)
        } catch (err: unknown) {
            console.error('Error sending mail', err)
            throw new Error('Could not send email')
        }
    }
}
