import mongoose , {Schema , Document} from 'mongoose'
import { Task } from '../../domain/entities/Task'

export interface ITaskDoc extends Omit<Task, 'id'>, Document {}

const TaskSchema = new Schema<ITaskDoc>(
    {
        projectId : {type :String , required : true , index : true},
        orgId : {type : String , required : true},
        title : {type : String , requried : true},
        description : {type : String},
        status : {type : String , enum : ['TODO' , 'IN_PROGRESS' , 'REVIEW' , 'DONE'] , default : 'TODO'},
        priority : {type : String , enum : ['LOW' , 'MEDIUM' , 'HIGH' , 'CRITICAL'] , default : 'MEDIUM'},
        assignedTo :{type : String , index : true},
        dueDate : {type : Date},
    },
    {timestamps : true}
)

export const TaskModel = mongoose.model<ITaskDoc>('Task' , TaskSchema)