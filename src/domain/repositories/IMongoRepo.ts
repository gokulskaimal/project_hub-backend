import { IUserRepo } from "./IUserRepo";
import { User } from "../auth/User";
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email : {type : String , required : true , unique : true},
    password : {type :  String , required : true}
})

const UserModel = mongoose.model("User" , userSchema)

