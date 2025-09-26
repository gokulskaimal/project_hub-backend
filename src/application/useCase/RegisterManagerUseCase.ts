import bcrypt from 'bcrypt'
import { IUserRepo } from "../../domain/interface/IUserRepo";
import { IOtpService } from "../../domain/interface/IOtpService";
import { IEmailService } from "../../domain/interface/IEmailService";
import { UserRole } from "../../domain/enums/UserRole";


export class RegisterManagerUseCase {

    constructor(
        private userRepo: IUserRepo,
        private otpService: IOtpService,
        private emailService: IEmailService
    ) { }

    async execute(email: string, orgId: string) {

        const otp = this.otpService.generateOtp()
        const expiry = this.otpService.generateExpiry()

        const temporaryPassword = await bcrypt.hash(Math.random().toString(36).slice(2), 10)

        await this.userRepo.create({
            email,
            orgId,
            role: UserRole.ORG_MANAGER,
            password: temporaryPassword,
            otp,
            otpExpiry: expiry,
            emailVerified: false
        })
        await this.emailService.send(email, 'Your OTP', `OTP: ${otp}`)

        return { message: 'OTP sent to email' }
    }
}