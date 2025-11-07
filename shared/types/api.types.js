"use strict";
/**
 * API Types - Shared between Frontend and Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorCode = exports.HttpStatus = void 0;
// Common HTTP Status Codes
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
// API Error Codes
var ApiErrorCode;
(function (ApiErrorCode) {
    // Authentication Errors
    ApiErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ApiErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ApiErrorCode["TOKEN_INVALID"] = "TOKEN_INVALID";
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    // User Errors
    ApiErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ApiErrorCode["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
    // Document Errors
    ApiErrorCode["DOCUMENT_NOT_FOUND"] = "DOCUMENT_NOT_FOUND";
    ApiErrorCode["DOCUMENT_UPLOAD_FAILED"] = "DOCUMENT_UPLOAD_FAILED";
    ApiErrorCode["DOCUMENT_PROCESSING_FAILED"] = "DOCUMENT_PROCESSING_FAILED";
    ApiErrorCode["INVALID_FILE_TYPE"] = "INVALID_FILE_TYPE";
    ApiErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    // Subscription Errors
    ApiErrorCode["SUBSCRIPTION_LIMIT_REACHED"] = "SUBSCRIPTION_LIMIT_REACHED";
    ApiErrorCode["QUESTIONS_LIMIT_REACHED"] = "QUESTIONS_LIMIT_REACHED";
    ApiErrorCode["DOCUMENTS_LIMIT_REACHED"] = "DOCUMENTS_LIMIT_REACHED";
    ApiErrorCode["PAYMENT_REQUIRED"] = "PAYMENT_REQUIRED";
    // General Errors
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ApiErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(ApiErrorCode || (exports.ApiErrorCode = ApiErrorCode = {}));
//# sourceMappingURL=api.types.js.map