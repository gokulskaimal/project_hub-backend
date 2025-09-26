import {IOtpService} from '../../domain/interface/IOtpService'

export class OTPService implements IOtpService{
    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    generateExpiry(): Date {
        return new Date(Date.now() + 5 * 60000)
    }
}