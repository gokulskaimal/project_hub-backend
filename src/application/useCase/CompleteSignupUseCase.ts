import { IUserRepo } from "../../domain/interface/IUserRepo";
import bcrypt from 'bcrypt'

export class CompleteSignupUseCase{
    constructor(private userRepo : IUserRepo){}

    async execute(email : string , name :string , password : string){
        const user = await this.userRepo.findByEmail(email)
        if(!user){
            throw new Error('User not found')
        }
        if(!user.emailVerified){
            throw new Error('User is not verified')
        }

        const hashedPassword = await bcrypt.hash(password , 10)

        return this.userRepo.updateProfile(user.id , {name , password : hashedPassword})
    }
}