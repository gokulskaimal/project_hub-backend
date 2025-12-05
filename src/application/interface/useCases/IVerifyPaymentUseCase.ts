export interface IVerifyPaymentUseCase {
  execute(
    orderId: string,
    paymentId: string,
    signature: string,
    orgId: string,
  ): Promise<boolean>;
}
