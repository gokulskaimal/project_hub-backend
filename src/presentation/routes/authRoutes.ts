import express from 'express'
import { AuthController } from '../controllers/AuthController'
import { UserRepo } from '../../infrastructure/repositories/UserRepo'
import { OTPService } from '../../infrastructure/sevices/OTPService'
import { EmailService } from '../../infrastructure/sevices/EmailService'
import { InviteRepo } from '../../infrastructure/repositories/InviteRepo'
import { RegisterManagerUseCase } from '../../application/useCase/RegisterManagerUseCase'
import { SendOtpUseCase } from '../../application/useCase/SendOtpUseCase'
import { VerifyOtpUseCase } from '../../application/useCase/VerifyOtpUseCase'
import { CompleteSignupUseCase } from '../../application/useCase/CompleteSignupUseCase'
import { InviteMemberUseCase } from '../../application/useCase/InviteMemberUseCase'
import { AcceptUseCase } from '../../application/useCase/AcceptUseCase'
import { AuthUseCases } from '../../application/useCase/AuthUseCase'
import { authMiddleware } from '../../middleware/AuthMiddleware'

const userRepo = new UserRepo()
const otpService = new OTPService()
const emailService = new EmailService()
const inviteRepo = new InviteRepo()
const authUseCase = new AuthUseCases(userRepo)

const registerManagerUC = new RegisterManagerUseCase(userRepo, otpService, emailService)
const sendOtpUC = new SendOtpUseCase(userRepo, emailService)
const verifyOtpUC = new VerifyOtpUseCase(userRepo)
const completeSignupUC = new CompleteSignupUseCase(userRepo)
const inviteMemberUC = new InviteMemberUseCase(inviteRepo, emailService)
const acceptUC = new AcceptUseCase(inviteRepo, userRepo)

const authController = new AuthController(registerManagerUC, sendOtpUC, verifyOtpUC, inviteMemberUC, acceptUC, authUseCase , completeSignupUC)

const router = express.Router()

router.post('/login' , (req , res) => authController.login(req,res))
router.post('/refresh-token' , (req,res) => authController.refreshToken(req,res))
router.post('/reset-password-request' , (req,res) => authController.resetPasswordReq(req,res))
router.post('/reset-password',(req,res) => authController.resetPassword(req,res))
router.post('/verify-email', authMiddleware, (req, res) => authController.verifyEmail(req, res))

router.post('/register-manager', (req, res) => authController.registerManager(req, res))
router.post('/send-otp', (req, res) => authController.sendOtp(req, res))
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res))
router.post('/complete-signup', (req, res) => authController.completeSignup(req, res))
router.post('/invite-member', (req, res) => authController.inviteMember(req, res))
router.post('/accept-invite', (req, res) => authController.acceptInvite(req, res))

export default router