export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
    duration?: number;
    type: "STARTER" | "PRO" | "ENTERPRISE";
    isActive: boolean;
    razorpayPlanId: string;
    limits: {
        projects: number;
        members: number;
        storage?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Plan.d.ts.map