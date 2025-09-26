import express from 'express'
import { UserController } from '../controllers/UserController'
import { UserRepo } from '../../infrastructure/repositories/UserRepo'
import { UserProfileUseCase } from '../../application/useCase/UserProfileUseCase'
import { authMiddleware } from '../../middleware/AuthMiddleware'

const router = express.Router()

const userRepo = new UserRepo()
const userProfileUseCase = new UserProfileUseCase(userRepo)
const userController = new UserController(userProfileUseCase)

router.get('/profile', authMiddleware , (req ,res) => userController.getProfile(req,res))
router.put('/profile', authMiddleware ,(req, res) => userController.updateProfile(req,res))

export default router