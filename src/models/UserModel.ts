import mongoose from 'mongoose'
import {UserRole} from '../domain/enums/UserRole'

const UserSchema = new mongoose.Schema({
    email : {type : String , required : true , unique : true},
    password : {type : String },
    role : {type : String , enum : Object.values(UserRole) , required : true},
    orgId : {type : String},
    otp : {type : String},
    otpExpiry : {type : Date},
    emailVerified : {type : Boolean , default : false}
})

export default mongoose.model('User' , UserSchema)