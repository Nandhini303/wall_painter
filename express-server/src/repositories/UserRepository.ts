import mongoose from 'mongoose';
import User, { IUser } from '../models/User';

const inMemoryUsers = new Map<string, any>();

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.findById(id);
      }
    } catch (e) {}
    return inMemoryUsers.get(id) || null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.findOne({ email });
      }
    } catch (e) {}

    const lower = email.toLowerCase();
    for (const u of inMemoryUsers.values()) {
      if (u.email.toLowerCase() === lower) return u;
    }
    return null;
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      if (mongoose.connection.readyState === 1) {
        const user = new User(userData);
        return await user.save();
      }
    } catch (e) {}

    const id = new mongoose.Types.ObjectId().toString();
    const mockUser: any = {
      _id: id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject: function() { return this; }
    };
    inMemoryUsers.set(id, mockUser);
    return mockUser;
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
      }
    } catch (e) {}

    const existing = inMemoryUsers.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updateData, updatedAt: new Date() };
    inMemoryUsers.set(id, updated);
    return updated;
  }

  async listAll(limit = 50, skip = 0): Promise<IUser[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.find().limit(limit).skip(skip).sort({ createdAt: -1 });
      }
    } catch (e) {}

    return Array.from(inMemoryUsers.values()).slice(skip, skip + limit);
  }

  async delete(id: string): Promise<IUser | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.findByIdAndDelete(id);
      }
    } catch (e) {}

    const existing = inMemoryUsers.get(id);
    if (existing) inMemoryUsers.delete(id);
    return existing || null;
  }
}
