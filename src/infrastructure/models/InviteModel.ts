import mongoose from 'mongoose'

const inviteSchema = new mongoose.Schema({
    email : {type : String , required : true} ,
    orgId : {type : String , required : true},
    token : {type : String , required : true , unique : true},
    status : {type : String , enum : ['PENDING' , 'ACCEPTED' , 'EXPIRED'] , default : 'PENDING'},
    expiry : {type : Date , required : true}
})

export default mongoose.model('Invite' , inviteSchema)
