import { IUserRepo } from "../../domain/interface/IUserRepo";
import {IOrgRepo} from '../../domain/interface/IOrgRepo'
import bcrypt from 'bcrypt'
import { UserRole } from "../../domain/enums/UserRole";

export class InviteSignupUseCase{
    constructor(
        private userRepo : IUserRepo,
        private orgRepo : IOrgRepo
    ){}

    async signup(email : string , password : string , orgId : string , role : UserRole){
        const existingUser = await this.userRepo.findByEmail(email)
        if(existingUser) throw new Error('User already exists')
        const org = await this.orgRepo.findById(orgId)
        if(!org) throw new Error('Organization Not Found')
        const hashed = await bcrypt.hash(password,10)
        return this.userRepo.create({
            email,
            password : hashed,
            orgId,
            role,
            emailVerified : false
        })
    }
}