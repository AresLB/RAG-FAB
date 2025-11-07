"use strict";
/**
 * User Types - Shared between Frontend and Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlan = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "free";
    SubscriptionPlan["BASIC"] = "basic";
    SubscriptionPlan["PRO"] = "pro";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
//# sourceMappingURL=user.types.js.map