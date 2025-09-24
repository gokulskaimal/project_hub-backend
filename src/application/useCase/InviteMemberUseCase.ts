import { IEmailService } from "../../domain/interface/IEmailService";
import { IInviteRepo } from "../../domain/interface/IInviteRepo";


export class InviteMemberUseCase{

    constructor(
        private inviteRepo : IInviteRepo,
        private emailService : IEmailService
    ){}

    async execute(email : string , orgId : string){
        
        const token = Math.random().toString(36).slice(2)
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await this.inviteRepo.create({
            email , 
            orgId , 
            token , 
            status : 'PENDING' , 
            expiry
        })

        return {message : 'Invite sent'}
    }
}