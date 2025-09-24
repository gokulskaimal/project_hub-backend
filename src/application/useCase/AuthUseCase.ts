import { IUserRepo } from "../../domain/interface/IUserRepo";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export class AuthUseCases{

    constructor(private userRepo : IUserRepo){}

    async login(email : string , password : string){
        const user = await this.userRepo.findByEmail(email)
        if(!user) throw new Error('Invalid credentials')
        const valid = await bcrypt.compare(password , user.password)
        if(!valid) throw new Error('Invalid credentials')
        const accessToken = jwt.sign({id : user.id , role : user.role} , process.env.)
    }
}