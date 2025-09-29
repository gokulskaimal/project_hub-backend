import { IInviteRepo } from "../../domain/interface/IInviteRepo";
import { Invite } from "../../domain/entities/Invite";

const invites : Invite[] = []

export class InviteRepo implements IInviteRepo{

    async create(invite: Partial<Invite>): Promise<Invite> {
        const newInvite = {...invite , id : Math.random().toString(36).slice(2),status : 'PENDING'} as Invite
        invites.push(newInvite)
        return newInvite
    }

    async findByToken(token: string): Promise<Invite | null> {
        return invites.find( i => i.token == token) || null
    }

    async markAccepted(token: string): Promise<void> {
        const invite = invites.find(i=> i.token == token)
        if(invite) {invite.status = 'ACCEPTED'}
    }

    async expire(token: string): Promise<void> {
        const invite = invites.find( i=> i.token == token)
        if(invite) {invite.status = 'EXPIRED'}
    }
}