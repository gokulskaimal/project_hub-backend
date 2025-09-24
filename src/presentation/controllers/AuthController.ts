import {Request , Response} from 'express'
import {RegisterManagerUseCase} from '../../application/useCase/RegisterManagerUseCase'
import {VerifyOtpUseCase} from '../../application/useCase/VerifyOtpUseCase'
import {InviteMemberUseCase} from '../../application/useCase/InviteMemberUseCase'
import {AcceptUseCase} from '../../application/useCase/AcceptUseCase'

export class AuthController{
    constructor(
        private registerManagerUC : RegisterManagerUseCase,
        private verifyOtpUC : VerifyOtpUseCase,
        private inviteMemberUC : InviteMemberUseCase,
        private acceptUC : AcceptUseCase
    ){}

    async registerManager(req : Request , res : Response){
        const {email , orgId} = req.body
        const result = await this.registerManagerUC.execute(email , orgId)
        res.json(result)
    }

    async verifyOtp(req : Request , res : Response){

        const {email , otp} = req.body

        try{
            const user = await this.verifyOtpUC.execute(email , otp)
            res.json({message : 'OTP verified' , user})
        }catch(err : any){
            res.status(400).json({error : err.message})
        }
    }

    async inviteMember(req : Request , res : Response){
        const {email , orgId} = req.body
        const result = await this.inviteMemberUC.execute(email , orgId)
        res.json(result)
    }

    async acceptInvite(req : Request , res : Response){
        const {token , password} = req.body

        try{
            const result = await this.acceptUC.execute(token , password)
            res.json(result)
        }catch(err : any){
            res.status(400).json({error : err.message})
        }
    }
}