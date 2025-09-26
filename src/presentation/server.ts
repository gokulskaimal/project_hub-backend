import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import 'dotenv/config'


const app = express()

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth' , authRoutes)
app.use('/api/user' , userRoutes)

const PORT = process.env.PORT || 4000

app.listen(PORT , () =>{
    console.log(`Server running on port ${PORT}`)
})