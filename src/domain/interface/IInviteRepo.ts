import { Invite } from "../entities/invite";


export interface IInviteRepo {
    create(invite: Partial<Invite>): Promise<Invite>
    findByToken(token: string): Promise<Invite | null>
    markAccepted(token: string): Promise<void>
    expire(token: string): Promise<void>
}