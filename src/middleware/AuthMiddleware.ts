import {Request , Response , NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export function authMiddleware(req : Request , res : Response , next : NextFunction){
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if(!token) return res.status(401).json({error : 'Missing Token'})

    try{
        const payload = jwt.verify(token , process.env.JWT_SECRET)
        req.user = payload
        next()
    }catch(err){
        res.status(401).json({error : 'Invalid token'})
    }
}