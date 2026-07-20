"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const inMemoryUsers = new Map();
class UserRepository {
    async findById(id) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await User_1.default.findById(id);
            }
        }
        catch (e) { }
        return inMemoryUsers.get(id) || null;
    }
    async findByEmail(email) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await User_1.default.findOne({ email });
            }
        }
        catch (e) { }
        const lower = email.toLowerCase();
        for (const u of inMemoryUsers.values()) {
            if (u.email.toLowerCase() === lower)
                return u;
        }
        return null;
    }
    async create(userData) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                const user = new User_1.default(userData);
                return await user.save();
            }
        }
        catch (e) { }
        const id = new mongoose_1.default.Types.ObjectId().toString();
        const mockUser = {
            _id: id,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
            toObject: function () { return this; }
        };
        inMemoryUsers.set(id, mockUser);
        return mockUser;
    }
    async update(id, updateData) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await User_1.default.findByIdAndUpdate(id, updateData, { new: true });
            }
        }
        catch (e) { }
        const existing = inMemoryUsers.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updateData, updatedAt: new Date() };
        inMemoryUsers.set(id, updated);
        return updated;
    }
    async listAll(limit = 50, skip = 0) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await User_1.default.find().limit(limit).skip(skip).sort({ createdAt: -1 });
            }
        }
        catch (e) { }
        return Array.from(inMemoryUsers.values()).slice(skip, skip + limit);
    }
    async delete(id) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await User_1.default.findByIdAndDelete(id);
            }
        }
        catch (e) { }
        const existing = inMemoryUsers.get(id);
        if (existing)
            inMemoryUsers.delete(id);
        return existing || null;
    }
}
exports.UserRepository = UserRepository;
