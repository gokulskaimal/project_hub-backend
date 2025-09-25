import mongoose , {Document, Types} from 'mongoose'

export interface IPlanDoc extends Document{
    _id : Types.ObjectId
    name : string
    maxUsers : number
    pricePerMonth : number
}

const PlanSchema = new mongoose.Schema<IPlanDoc>({
    name : {type : String , required : true},
    maxUsers : {type : Number , required : true},
    pricePerMonth : {type : Number , required : true}
})

export default mongoose.model('Plan' , PlanSchema)
