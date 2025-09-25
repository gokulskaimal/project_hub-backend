import mongoose ,{Document, Types} from 'mongoose'

export interface IOrgDOc extends Document{
    _id: Types.ObjectId
    name : string
    planId? : Types.ObjectId
}

const OrgSchema = new mongoose.Schema<IOrgDOc>({
    name : {type : String , required : true},
    planId : {type : mongoose.Schema.Types.ObjectId , ref : 'Plan'},
})

export default mongoose.model<IOrgDOc>('Organization', OrgSchema)