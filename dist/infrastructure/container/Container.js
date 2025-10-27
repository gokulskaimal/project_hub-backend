"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.diContainer = void 0;
// src/infrastructure/container/Container.ts
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
// Infrastructure Implementations - Services
const Logger_1 = require("../services/Logger");
const HashService_1 = require("../services/HashService");
const JwtService_1 = require("../services/JwtService");
const EmailService_1 = require("../services/EmailService");
const OTPService_1 = require("../services/OTPService");
const JsonWebTokenProvider_1 = require("../services/providers/JsonWebTokenProvider");
// Infrastructure Implementations - Repositories
const UserRepo_1 = require("../repositories/UserRepo");
const OrgRepo_1 = require("../repositories/OrgRepo");
const InviteRepo_1 = require("../repositories/InviteRepo");
// Application Use Cases
const AuthUseCase_1 = require("../../application/useCase/AuthUseCase");
const RegisterManagerUseCase_1 = require("../../application/useCase/RegisterManagerUseCase");
const SendOtpUseCase_1 = require("../../application/useCase/SendOtpUseCase");
const VerifyOtpUseCase_1 = require("../../application/useCase/VerifyOtpUseCase");
const CompleteSignupUseCase_1 = require("../../application/useCase/CompleteSignupUseCase");
const AcceptUseCase_1 = require("../../application/useCase/AcceptUseCase");
const InviteMemberUseCase_1 = require("../../application/useCase/InviteMemberUseCase");
const ResetPasswordUseCase_1 = require("../../application/useCase/ResetPasswordUseCase");
// Presentation Controllers
const AuthController_1 = require("../../presentation/controllers/AuthController");
const AdminController_1 = require("../../presentation/controllers/AdminController");
class DIContainer {
    constructor() {
        this._container = new inversify_1.Container();
        this._configureBindings();
    }
    /**
     * Services -> Repositories -> Use Cases -> Controllers
     */
    _configureBindings() {
        this._bindServices();
        this._bindRepositories();
        this._bindUseCases();
        this._bindControllers();
    }
    _bindServices() {
        this._container.bind(types_1.TYPES.ILogger).to(Logger_1.Logger).inSingletonScope();
        this._container.bind(types_1.TYPES.IHashService).to(HashService_1.HashService).inSingletonScope();
        this._container.bind(types_1.TYPES.IJwtProvider).to(JsonWebTokenProvider_1.JsonWebTokenProvider).inSingletonScope();
        this._container.bind(types_1.TYPES.IJwtService).to(JwtService_1.JwtService).inSingletonScope();
        this._container.bind(types_1.TYPES.IEmailService).to(EmailService_1.EmailService).inSingletonScope();
        this._container.bind(types_1.TYPES.IOtpService).to(OTPService_1.OtpService).inSingletonScope();
    }
    _bindRepositories() {
        this._container.bind(types_1.TYPES.IUserRepo).to(UserRepo_1.UserRepo).inSingletonScope();
        this._container.bind(types_1.TYPES.IOrgRepo).to(OrgRepo_1.OrgRepo).inSingletonScope();
        this._container.bind(types_1.TYPES.IInviteRepo).to(InviteRepo_1.InviteRepo).inSingletonScope();
    }
    _bindUseCases() {
        this._container.bind(types_1.TYPES.IAuthUseCases).to(AuthUseCase_1.AuthUseCases).inTransientScope();
        this._container.bind(types_1.TYPES.IRegisterManagerUseCase).to(RegisterManagerUseCase_1.RegisterManagerUseCase).inTransientScope();
        this._container.bind(types_1.TYPES.ISendOtpUseCase).to(SendOtpUseCase_1.SendOtpUseCase).inTransientScope();
        this._container.bind(types_1.TYPES.IVerifyOtpUseCase).to(VerifyOtpUseCase_1.VerifyOtpUseCase).inTransientScope();
        this._container.bind(types_1.TYPES.ICompleteSignupUseCase).to(CompleteSignupUseCase_1.CompleteSignupUseCase).inTransientScope();
        this._container.bind(types_1.TYPES.IAcceptUseCase).to(AcceptUseCase_1.AcceptUseCase).inTransientScope();
        this._container.bind(types_1.TYPES.IInviteMemberUseCase).to(InviteMemberUseCase_1.InviteMemberUseCase).inTransientScope();
        this._container.bind(types_1.TYPES.IResetPasswordUseCase).to(ResetPasswordUseCase_1.ResetPasswordUseCase).inTransientScope();
    }
    _bindControllers() {
        this._container.bind(types_1.TYPES.AuthController).to(AuthController_1.AuthController).inSingletonScope();
        this._container.bind(types_1.TYPES.AdminController).to(AdminController_1.AdminController).inSingletonScope();
    }
    get container() {
        return this._container;
    }
    get(serviceIdentifier) {
        return this._container.get(serviceIdentifier);
    }
    isBound(serviceIdentifier) {
        return this._container.isBound(serviceIdentifier);
    }
    unbind(serviceIdentifier) {
        this._container.unbind(serviceIdentifier);
    }
    rebind(serviceIdentifier) {
        return this._container.rebind(serviceIdentifier);
    }
}
// Export singleton container instance
exports.diContainer = new DIContainer();
exports.container = exports.diContainer.container;
//# sourceMappingURL=Container.js.map