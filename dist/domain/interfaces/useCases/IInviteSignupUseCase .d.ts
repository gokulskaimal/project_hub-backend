export interface IInviteSignupUseCase {
    /**
     * Complete signup via invitation
     */
    execute(inviteToken: string, userData: {
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }): Promise<{
        user: any;
        organization: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    /**
     * Get invitation details
     */
    getInvitationDetails(token: string): Promise<{
        email: string;
        organizationName: string;
        invitedBy: string;
        expiresAt: Date;
        role?: string;
    }>;
}
//# sourceMappingURL=IInviteSignupUseCase%20.d.ts.map