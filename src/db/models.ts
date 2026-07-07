import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: 'avatar-1' },
  joinDate: { type: String, default: () => new Date().toISOString() },
  theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  language: { type: String, enum: ['id', 'en'], default: 'id' },
  focusTarget: { type: Number, default: 4 },
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  priority: { type: String, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { timestamps: true });

// Prevent model overwrite upon hot reloads in Vercel
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
