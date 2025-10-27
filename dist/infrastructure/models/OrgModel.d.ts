import mongoose, { Document, Types } from 'mongoose';
export interface IOrgDOc extends Document {
    _id: Types.ObjectId;
    name: string;
    planId?: Types.ObjectId;
    status?: string;
    createdAt: Date;
    updatedAt: Date;
    displayName?: string;
    description?: string;
    logo?: string;
    website?: string;
    subscriptionStatus?: string;
    maxManagers?: number;
    maxUsers?: number;
    currentUserCount?: number;
    industry?: string;
    size?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    contact?: {
        email?: string;
        phone?: string;
        supportEmail?: string;
    };
    billing?: {
        billingEmail?: string;
        taxId?: string;
        currency?: string;
        paymentMethod?: string;
    };
    settings?: Record<string, any>;
    features?: string[];
    timezone?: string;
    locale?: string;
    createdBy?: Types.ObjectId | string;
    trialStartsAt?: Date;
    trialEndsAt?: Date;
    subscriptionStartsAt?: Date;
    subscriptionEndsAt?: Date;
    lastActivityAt?: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletionReason?: string;
    customFields?: Record<string, any>;
    tags?: string[];
    priority?: string;
    onboardingStatus?: {
        completed: boolean;
        currentStep?: number;
        completedSteps?: number[];
        completedAt?: Date;
    };
    integrations?: Record<string, {
        enabled: boolean;
        config?: Record<string, any>;
        connectedAt?: Date;
    }>;
    usage?: {
        storageUsed?: number;
        storageLimit?: number;
        apiCallsUsed?: number;
        apiCallsLimit?: number;
        lastResetAt?: Date;
    };
    metadata?: Record<string, any>;
}
declare const _default: mongoose.Model<IOrgDOc, {}, {}, {}, mongoose.Document<unknown, {}, IOrgDOc, {}, {}> & IOrgDOc & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=OrgModel.d.ts.map