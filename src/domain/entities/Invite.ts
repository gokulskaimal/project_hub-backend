export interface Invite{
    id: string
    email: string
    orgId : string
    token : string
    status : 'PENDING' | 'ACCEPTED' | 'EXPIRED'
    expiry: Date
}