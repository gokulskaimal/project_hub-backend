import { User } from "../auth/User";

export interface IUserRepo{
    findByEmail(email : string) : Promise<User | null>
}