"use strict";
/**
 * Chat Types - Shared between Frontend and Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationStatus = exports.MessageRole = void 0;
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["ACTIVE"] = "active";
    ConversationStatus["ARCHIVED"] = "archived";
    ConversationStatus["DELETED"] = "deleted";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
//# sourceMappingURL=chat.types.js.map