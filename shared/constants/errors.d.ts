/**
 * Error Messages and Codes
 */
import { ApiErrorCode, HttpStatus } from '../types/api.types';
export interface ErrorDefinition {
    code: ApiErrorCode;
    message: string;
    statusCode: HttpStatus;
}
export declare const ERROR_MESSAGES: Record<ApiErrorCode, ErrorDefinition>;
export declare const getErrorDefinition: (code: ApiErrorCode) => ErrorDefinition;
//# sourceMappingURL=errors.d.ts.map