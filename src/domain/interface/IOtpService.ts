export interface IOtpService{
    generateOtp() : string
    generateExpiry() : Date
}