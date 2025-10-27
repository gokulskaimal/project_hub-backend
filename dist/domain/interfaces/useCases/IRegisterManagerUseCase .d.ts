export interface IRegisterManagerUseCase {
    /**
     * Register organization manager
     */
    execute(email: string, organizationName: string): Promise<{
        message: string;
        organizationId: string;
        invitationToken: string;
    }>;
    /**
     * Validate organization name availability
     */
    validateOrganizationName(name: string): Promise<boolean>;
}
//# sourceMappingURL=IRegisterManagerUseCase%20.d.ts.map