import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IRazorpayService } from "../../infrastructure/interface/services/IRazorpayService";
import { IVerifyPaymentUseCase } from "../interface/useCases/IVerifyPaymentUseCase";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { IInvoiceRepo } from "../../infrastructure/interface/repositories/IInvoiceRepo";

@injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUseCase: ICreateNotificationUseCase,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.IInvoiceRepo) private _invoiceRepo: IInvoiceRepo,
  ) {}

  async execute(
    orderId: string,
    paymentId: string,
    signature: string,
    orgId: string,
  ): Promise<boolean> {
    try {
      const isValid = this._razorpayService.verifySignature(
        orderId,
        paymentId,
        signature,
      );

      if (!isValid) return false;
      const localSub =
        await this._subscriptionRepo.findByRazorpaySubscriptionId(orderId);

      if (localSub) {
        const plan = await this._planRepo.findById(localSub.planId);

        if (plan) {
          await this._orgRepo.update(orgId, {
            subscriptionStatus: "ACTIVE",
            razorpaySubscriptionId: orderId,
            planId: plan.id,
            subscriptionStartsAt: new Date(),
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            maxUsers: plan.limits.members,
            maxManagers: plan.limits.projects,
          });

          await this._subscriptionRepo.update(localSub.id, {
            status: "active",
          });

          await this._invoiceRepo.create({
            orgId: orgId,
            planId: plan.id,
            razorpayPaymentId: paymentId,
            amount: plan.price,
            currency: plan.currency || "INR",
            status: "PAID",
          });

          const organization = await this._orgRepo.findById(orgId);
          if (organization) {
            const superAdmins = await this._userRepo.findByRole(
              UserRole.SUPER_ADMIN,
            );

            for (const admin of superAdmins) {
              await this._createNotificationUseCase.execute(
                admin.id,
                "Plan Purchased",
                `Organization "${organization.name}" has successfully purchased the ${plan.name} plan.`,
                "SUCCESS",
                orgId,
              );
            }
          }

          this._socketService.emitToRole(
            UserRole.SUPER_ADMIN,
            "plan:purchased",
            {
              organizationName: organization?.name,
              planName: plan.name,
              organizationId: orgId,
            },
          );
        }
      } else {
        console.warn("Local subscription record not found for order:", orderId);
      }
    } catch (error) {
      console.error("Failed to verify payment and update subscription", error);
      return false;
    }

    return true;
  }
}
