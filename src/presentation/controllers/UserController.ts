import {Request , Response} from 'express'
import { UserProfileUseCase } from '../../application/useCase/UserProfileUseCase'
import { AuthenticatedRequest } from '../../middleware/types/AuthenticatedRequest'

export class UserController{
    constructor(private userProfileUSeCase : UserProfileUseCase){}

    async getProfile(req : AuthenticatedRequest , res : Response){
        try{
            const userId = req.user!.id
            const profile = await this.userProfileUSeCase.getProfile(userId)
            res.json(profile)
        }catch(err : any){
            res.status(404).json({error : err.message})
        }
    }

    async updateProfile(req : AuthenticatedRequest , res : Response){
        try{
            const userId = req.user!.id
            const updatedProfile = await this.userProfileUSeCase.updateProfile(userId , req.body)
            res.json(updatedProfile)
        }catch(err : any){
            res.status(400).json({error : err.message})
        }
    }
}