import bcrypt from 'bcrypt'
import { UserRole } from "../../domain/enums/UserRole";
import { IInviteRepo } from "../../domain/interface/IInviteRepo";
import { IUserRepo } from "../../domain/interface/IUserRepo";


export class AcceptUseCase {

    constructor(
        private inviteRepo: IInviteRepo,
        private userRepo: IUserRepo
    ) { }

    async execute(token: string, password: string) {

        const invite = await this.inviteRepo.findByToken(token)

        if (!invite || invite.expiry < new Date() || invite.status != 'PENDING') throw new Error('Invite Expired')

        const hashedPassword = await bcrypt.hash(password, 10)
        await this.userRepo.create({
            email: invite.email,
            orgId: invite.orgId,
            role: UserRole.TEAM_MEMBER,
            password: hashedPassword,
            emailVerified: true
        })

        await this.inviteRepo.markAccepted(token)
        return { message: 'Registration complete' }

    }
}