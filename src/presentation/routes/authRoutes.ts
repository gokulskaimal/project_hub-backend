import express from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserRepo } from '../../infrastructure/repositories/UserRepo'
import { OTPService } from '../../infrastructure/sevices/OTPService'
import { EmailService } from '../../infrastructure/sevices/EmailService'
import { InviteRepo } from '../../infrastructure/repositories/InviteRepo'
import { RegisterManagerUseCase } from '../../application/useCase/RegisterManagerUseCase'
import { VerifyOtpUseCase } from '../../application/useCase/VerifyOtpUseCase'
import { InviteMemberUseCase } from '../../application/useCase/InviteMemberUseCase'
import { AcceptUseCase } from '../../application/useCase/AcceptUseCase'
import { AuthUseCases } from '../../application/useCase/AuthUseCase'

const userRepo = new UserRepo()
const otpService = new OTPService()
const emailService = new EmailService()
const inviteRepo = new InviteRepo()
const authUseCase = new AuthUseCases(userRepo)

const registerManagerUC = new RegisterManagerUseCase(userRepo, otpService, emailService)
const verifyOtpUC = new VerifyOtpUseCase(userRepo)
const inviteMemberUC = new InviteMemberUseCase(inviteRepo, emailService)
const acceptUC = new AcceptUseCase(inviteRepo, userRepo)

const authController = new AuthController(registerManagerUC, verifyOtpUC, inviteMemberUC, acceptUC, authUseCase)

const router = express.Router()

router.post('/login' , (req , res) => authController.login(req,res))
router.post('/refresh-token' , (req,res) => authController.refreshToken(req,res))
router.post('/reset-password-request' , (req,res) => authController.resetPasswordReq(req,res))
router.post('/reset-password',(req,res) => authController.resetPassword(req,res))
router.post('/verfiy-email' ,  (req,res) => authController.verifyEmail(req,res))

router.post('/register-manager', (req, res) => authController.registerManager(req, res))
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res))
router.post('/invite-member', (req, res) => authController.inviteMember(req, res))
router.post('/accept-invite', (req, res) => authController.acceptInvite(req, res))

export default router