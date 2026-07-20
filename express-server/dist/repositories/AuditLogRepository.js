"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuditLogRepository {
    async create(logData) {
        if (logData.userId) {
            const idStr = logData.userId.toString();
            if (mongoose_1.default.Types.ObjectId.isValid(idStr)) {
                logData.userId = new mongoose_1.default.Types.ObjectId(idStr);
            }
            else {
                delete logData.userId;
            }
        }
        const log = new AuditLog_1.default(logData);
        return log.save();
    }
    async list(limit = 100, skip = 0) {
        return AuditLog_1.default.find().populate('userId', 'email firstName lastName role').limit(limit).skip(skip).sort({ timestamp: -1 });
    }
    async count() {
        return AuditLog_1.default.countDocuments();
    }
}
exports.AuditLogRepository = AuditLogRepository;
