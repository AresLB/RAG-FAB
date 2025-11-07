"use strict";
/**
 * Document Types - Shared between Frontend and Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStatus = exports.DocumentType = void 0;
var DocumentType;
(function (DocumentType) {
    DocumentType["PDF"] = "pdf";
    DocumentType["DOCX"] = "docx";
    DocumentType["TXT"] = "txt";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["UPLOADING"] = "uploading";
    DocumentStatus["PROCESSING"] = "processing";
    DocumentStatus["CHUNKING"] = "chunking";
    DocumentStatus["EMBEDDING"] = "embedding";
    DocumentStatus["READY"] = "ready";
    DocumentStatus["FAILED"] = "failed";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
//# sourceMappingURL=document.types.js.map