import { IEmailService } from "../../domain/interface/IEmailService";

export class EmailService implements IEmailService{
    async send(email: string, subject: string, body: string): Promise<void> {
        console.log(`sending email to ${email}`)
    }
}