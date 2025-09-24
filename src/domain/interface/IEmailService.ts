export interface IEmailService{
    send(email : string , subject : string , body : string) : Promise<void>
}