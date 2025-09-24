import { IUserRepo } from "../../domain/interface/IUserRepo";

export class VerifyOtpUseCase{

    constructor(
        private userRepo : IUserRepo
    ){}

    async execute(email : string , otp : string){
        
        const user = await this.userRepo.verifyOtp(email , otp)

        if(!user) throw new Error('Invalid OTP')
         
        return user
    }
}