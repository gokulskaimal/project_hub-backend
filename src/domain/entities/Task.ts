export interface Task{
    id :string
    projectId : string
    orgId: string
    title : string
    description? : string
    status : 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
    priority : 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    dueDate? : Date
    assignedTo? : string
    createdAt : Date
    updatedAt : Date
}