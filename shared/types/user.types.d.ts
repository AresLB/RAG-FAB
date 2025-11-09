/**
 * User Types - Shared between Frontend and Backend
 */
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare enum SubscriptionPlan {
    FREE = "free",
    BASIC = "basic",
    PRO = "pro"
}
export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    subscription: ISubscription;
    createdAt: Date;
    updatedAt: Date;
}
export interface ISubscription {
    plan: SubscriptionPlan;
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    questionsUsed: number;
    questionsLimit: number;
    documentsUsed: number;
    documentsLimit: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}
export interface IUserCreate {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface IUserLogin {
    email: string;
    password: string;
}
export interface IAuthResponse {
    user: Omit<IUser, 'password'>;
    token: string;
    refreshToken: string;
}
export interface ITokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface IUserUpdate {
    firstName?: string;
    lastName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}
//# sourceMappingURL=user.types.d.ts.map