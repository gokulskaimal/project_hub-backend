import { IUserRepo } from "../../domain/interface/IUserRepo";

export class UserProfileUseCase{
    constructor(private userRepo : IUserRepo){}

    async getProfile(userId : string){
        const user = await this.userRepo.findById(userId)
        if(!user) throw new Error('User not found')
        return user
    }

    async updateProfile(userId : string , data : Partial<unknown>){
        return this.userRepo.updateProfile(userId , data)
    }
}