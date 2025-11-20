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
        role: user.role,
        orgId: user.orgId ?? null,
        emailVerified: Boolean(user.emailVerified),
        emailVerifiedAt: toIso(user.emailVerifiedAt),
        status: user.status,
        createdAt: toIso(user.createdAt),
        updatedAt: toIso(user.updatedAt),
        lastLoginAt: toIso(user.lastLoginAt),
        joinedAt: toIso(user.joinedAt),
        avatar: user.avatar,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        timezone: user.timezone,
        language: user.language,
        title: user.title,
        department: user.department,
        bio: user.bio,
        dateOfBirth: toIso(user.dateOfBirth),
        profileComplete: Boolean(user.firstName && user.lastName && user.phone),
        hasPassword: Boolean(user.password && user.password.length > 0),
    };
}
//# sourceMappingURL=UserDTO.js.map