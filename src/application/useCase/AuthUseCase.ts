import { IUserRepo } from "../../domain/interface/IUserRepo";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export class AuthUseCases {

    constructor(private userRepo: IUserRepo) { }

    async login(email: string, password: string) {
        const user = await this.userRepo.findByEmail(email)
        if (!user) throw new Error('Invalid credentials')
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) throw new Error('Invalid credentials')
        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })
        return { accessToken, refreshToken }
    }

    async refreshToken(token: string) {
        try {
            const payload: any = jwt.verify(token, process.env.JWT_REFRESH_SECRET!)
            const user = await this.userRepo.findById(payload.id)
            if (!user) throw new Error('User not found')
            const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' })
            return accessToken
        } catch (err) {
            throw new Error('Invalid Token')
        }
    }

    async resetPasswordReq(email: string, generateToken: () => string) {
        const user = await this.userRepo.findByEmail(email)
        if (!user) throw new Error('User not found')
        const token = generateToken()
        const expires = new Date(Date.now() + 3600000)
        await this.userRepo.setResetPasswordToken(email, token, expires)
        return {token , expires}
    }

    async resetPassword(token : string , newPassword : string){
        const user = await this.userRepo.findByResetToken(token)
        if(!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) throw new Error('Token expired')
    }

    async verifyEmail(userId : string){
        await this.userRepo.verifyEmail(userId)
    }
}