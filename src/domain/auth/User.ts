export interface IUser{
    id ? : string
    email : string
    password : string
}


export class User{
    private props : IUser

    constructor(props : IUser){
        this.props = props
    }

    get id() : string | undefined{
        return this.props.id
    }

    get email() : string | undefined{
        return this.props.email
    }

    get password() : string | undefined{
        return this.props.password
    }
}