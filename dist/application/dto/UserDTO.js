"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserDTO = toUserDTO;
/**
 * Convert User entity to UserDTO (safe for API responses)
 * @param user - User domain entity
 * @returns UserDTO without sensitive data
 */
function toUserDTO(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        orgId: user.orgId,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        joinedAt: user.joinedAt,
        avatar: user.avatar,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        timezone: user.timezone,
        language: user.language,
        title: user.title,
        department: user.department,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        // Derived fields
        profileComplete: !!(user.firstName && user.lastName && user.phone),
        hasPassword: !!user.password && user.password.length > 0
    };
}
//# sourceMappingURL=UserDTO.js.map