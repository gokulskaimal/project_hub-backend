import { EmailPayload, IEmailService } from "../../domain/interface/IEmailService";
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

        const inviteEmailPayload: EmailPayload = {
            to: email,
            subject: 'You are invited to join Project Hub',
            text: `You have been invited to join the organization. Use the token ${token} to accept the invite.`
        }
        await this.emailService.sendEmail(inviteEmailPayload)

        return {message : 'Invite sent'}
    }
}