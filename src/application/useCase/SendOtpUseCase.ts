import { IUserRepo } from "../../domain/interface/IUserRepo";
import { EmailService } from "../../infrastructure/sevices/EmailService";

const otpStore = new Map<string , {otp : string , expiresAt : number}>()

export class SendOtpUseCase{
    private OTP_VALIDITY = 10 * 60 *1000
    constructor(
        private userRepo : IUserRepo,
        private emailService : EmailService
    ){}

    async execute(email : string) : Promise<void>{
        const existingUser = await this.userRepo.findByEmail(email)
        if(existingUser && existingUser.emailVerified){
            throw new Error('User already registered')
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = Date.now() + this.OTP_VALIDITY
        otpStore.set(email, {otp,expiresAt})

        await this.userRepo.ensureUserWithOtp(
            email,
            otp,
            new Date(expiresAt)
        )

        const subject = 'Your OTP Code'
        const text = `Your OTP code is ${otp}. It is valid for 10 minutes.`

        await this.emailService.sendEmail({
            to : email,
            subject,
            text
        })
    }

    isOtpvalid(email : string , otp : string) : boolean{
        const record = otpStore.get(email)
        if(!record) return false
        if(record.expiresAt < Date.now()){
            otpStore.delete(email)
            return false
        }
        if(record.otp !== otp) return false

        otpStore.delete(email)
        return true
    }
}