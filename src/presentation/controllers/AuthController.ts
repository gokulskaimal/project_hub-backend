import {Request , Response} from 'express'
import {RegisterManagerUseCase} from '../../application/useCase/RegisterManagerUseCase'
import {VerifyOtpUseCase} from '../../application/useCase/VerifyOtpUseCase'
import {InviteMemberUseCase} from '../../application/useCase/InviteMemberUseCase'
import {AcceptUseCase} from '../../application/useCase/AcceptUseCase'
import { AuthUseCases } from '../../application/useCase/AuthUseCase'
import { AuthenticatedRequest } from '../../middleware/types/AuthenticatedRequest'

export class AuthController{
    constructor(
        private registerManagerUC : RegisterManagerUseCase,
        private verifyOtpUC : VerifyOtpUseCase,
        private inviteMemberUC : InviteMemberUseCase,
        private acceptUC : AcceptUseCase,
        private authUseCase : AuthUseCases
    ){}

    async login(req : Request , res : Response){
        try{
            const {email , password} = req.body
            const tokens = await this.authUseCase.login(email,password)
            res.cookie('refreshToken' , tokens.refreshToken , {
                httpOnly : true,
                secure : process.env.NODE_ENv === 'production',
                maxAge : 7 * 24 * 3600 * 1000
            })
            res.json({accessToken : tokens.accessToken})
        }catch(err : any){
            res.status(401).json({error : err.message})
        }
    }

    async refreshToken(req : Request , res : Response){
        try{
            const token = req.cookies.refreshToken
            if(!token) throw new Error('No token')
            const accessToken = await this.authUseCase.refreshToken(token)
            res.json({accessToken})
        }catch(err : any){
            res.status(401).json({error : err.message})
        }
    }

    async resetPasswordReq(req : Request , res : Response){
        try{
            const {email} = req.body
            const {token} = await this.authUseCase.resetPasswordReq(email , () => Math.random().toString(36).slice(2))
            res.json({message : 'Reset token generated' , token})
        }catch(err : any){
            res.status(400).json({error : err.message})
        }
    }

    async resetPassword(req : Request , res : Response){
        try{
            const {token , newPassword}  = req.body
            await this.authUseCase.resetPassword(token , newPassword)
            res.json({message : 'Password reset successfull'})
        }catch(err : any){
            res.status(400).json({error : err.message})
        }
    }

    async verifyEmail(req : AuthenticatedRequest , res : Response){
        try{
            const userId = req.user!.id
            await this.authUseCase.verifyEmail(userId)
            res.json({message : 'Email verified'})
        }catch(err : any){
            res.status(400).json({error : err.message})
        }
    }
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