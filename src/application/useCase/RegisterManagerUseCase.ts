import { IUserRepo } from "../../domain/interface/IUserRepo";
import { IOtpService } from "../../domain/interface/IOtpService";
import { IEmailService } from "../../domain/interface/IEmailService";
import { UserRole } from "../../domain/enums/UserRole";


export class RegisterManagerUseCase{

    constructor(
        private userRepo : IUserRepo,
        private otpService : IOtpService,
        private emailService : IEmailService
    ){}

    async execute (email : string , orgId : string){

        const otp = this.otpService.generateOtp()
        const expiry = this.otpService.generateExpiry()
        
        await this.userRepo.create({
            email , 
            orgId , 
            role : UserRole.ORG_MANAGER , 
            otp , 
            otpExpiry : expiry , 
            emailVerified : false
        })

        return {message : 'OTP sent to email'}
    }
}