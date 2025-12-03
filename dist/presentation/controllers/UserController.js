"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserDTO_1 = require("../../application/dto/UserDTO");
const common_constants_1 = require("../../infrastructure/config/common.constants");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const asyncHandler_1 = require("../../utils/asyncHandler");
let UserController = class UserController {
    constructor(_logger, userProfileUseCase) {
        this._logger = _logger;
        this.userProfileUseCase = userProfileUseCase;
        this.getProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            this._logger.info("Fetching user profile", { userId });
            const profile = await this.userProfileUseCase.getProfile(userId);
            this.sendSuccess(res, (0, UserDTO_1.toUserDTO)(profile), common_constants_1.COMMON_MESSAGES.PROFILE_RETRIEVED);
        });
        this.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const updateData = req.body;
            this._logger.info("Updating user profile", {
                userId,
                updatedFields: Object.keys(updateData || {}),
            });
            if (!updateData || Object.keys(updateData).length === 0) {
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: common_constants_1.COMMON_MESSAGES.REQUIRED_FIELD,
                };
            }
            const updatedProfile = await this.userProfileUseCase.updateProfile(userId, updateData);
            this.sendSuccess(res, (0, UserDTO_1.toUserDTO)(updatedProfile), common_constants_1.COMMON_MESSAGES.PROFILE_UPDATED);
        });
        this.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            this._logger.info("Change password attempt", { userId });
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: common_constants_1.COMMON_MESSAGES.REQUIRED_FIELD,
                };
            }
            if (newPassword !== confirmNewPassword) {
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: common_constants_1.COMMON_MESSAGES.INVALID_INPUT,
                };
            }
            await this.userProfileUseCase.changePassword(userId, currentPassword, newPassword);
            this.sendSuccess(res, null, common_constants_1.COMMON_MESSAGES.PASSWORD_CHANGED);
        });
        this.deleteAccount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.id;
            const { password, confirmation } = req.body;
            this._logger.info("Delete account attempt", { userId });
            if (!password || confirmation !== "DELETE") {
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: common_constants_1.COMMON_MESSAGES.REQUIRED_FIELD,
                };
            }
            await this.userProfileUseCase.deleteAccount(userId, password);
            this.sendSuccess(res, null, common_constants_1.COMMON_MESSAGES.USER_DELETED);
        });
    }
    sendSuccess(res, data, message) {
        res
            .status(statusCodes_enum_1.StatusCodes.OK)
            .json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IUserProfileUseCase)),
    __metadata("design:paramtypes", [Object, Object])
], UserController);
//# sourceMappingURL=UserController.js.map