import bcrypt from 'bcrypt'
import { IUserRepo } from "../../domain/interface/IUserRepo";
import { IOtpService } from "../../domain/interface/IOtpService";
import { UserRole } from "../../domain/enums/UserRole";
import { EmailService } from '../../infrastructure/sevices/EmailService';


export class RegisterManagerUseCase {

    constructor(
        private userRepo: IUserRepo,
        private otpService: IOtpService,
        private emailService: EmailService
    ) { }

    async execute(email: string, orgId: string) {

        const user = await this.userRepo.findByEmail(email)
        if(user && user.emailVerified){
            throw new Error('User already exists')
        }

        const otp = this.otpService.generateOtp()
        const expiry = this.otpService.generateExpiry()

        await this.userRepo.create({
            email,
            orgId,
            role: UserRole.ORG_MANAGER,
            password: '',
            otp,
            otpExpiry: expiry,
            emailVerified: false
        })
        const subject = 'Your OTP for registration'
        const text = `Your OTP is ${otp}`
        await this.emailService.sendEmail({to : email ,subject,text})
        return { message: 'OTP sent to email' }
    }
}