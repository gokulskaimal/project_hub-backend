import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'


const app = express()
app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true,                 
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth' , authRoutes)
app.use('/api/user' , userRoutes)

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI!)

app.listen(PORT , () =>{
    console.log(`Server running on port ${PORT}`)
})

