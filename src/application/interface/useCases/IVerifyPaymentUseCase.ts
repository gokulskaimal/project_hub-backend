export interface IVerifyPaymentUseCase {
  execute(
    orderId: string,
    paymentId: string,
    signature: string,
  ): Promise<boolean>;
}
