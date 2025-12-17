"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDTO = toUserDTO;
/**
 * Convert domain User entity to UserDTO (safe for API responses)
 */
function toUserDTO(user) {
    const toIso = (d) => d ? new Date(d).toISOString() : undefined;
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar ?? null,
        role: user.role,
        orgId: user.orgId ?? null,
        organizationName: user.organizationName,
        emailVerified: Boolean(user.emailVerified),
        emailVerifiedAt: toIso(user.emailVerifiedAt),
        status: user.status,
        createdAt: toIso(user.createdAt),
        updatedAt: toIso(user.updatedAt),
        lastLoginAt: toIso(user.lastLoginAt),
        profileComplete: Boolean(user.firstName && user.lastName),
    };
}
//# sourceMappingURL=UserDTO.js.map