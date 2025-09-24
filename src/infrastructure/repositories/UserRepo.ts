import { IUserRepo } from "../../domain/interface/IUserRepo";
import { User } from "../../domain/entities/User"; 

const users : User[] = [] 

export class UserRepo implements IUserRepo{

    async create(user: Partial<User>): Promise<User> {
        const newUser = {...user, id : Math.random().toString(36).slice(2)} as User
        users.push(newUser)
        return newUser
    }

    async findByEmail(email: string): Promise<User | null> {
        return users.find( u=> u.email === email) || null;
    }

    async saveOtp(email: string, otp: string, expiry: Date): Promise<void> {
        const user = users.find(u => u.email == email)
        if(user) {user.otp == otp ; user.otpExpiry}
    }

    async verifyOtp(email: string, otp: string): Promise<User | null> {
        const user = users.find(u => u.email == email && u.otp == otp && u.otpExpiry! > new Date())

        if(!user) return null
        user.emailVerified = true
        return user
    }
}