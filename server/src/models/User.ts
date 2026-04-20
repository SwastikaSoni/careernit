import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role } from '../types';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  avatar?: string;
  department?: mongoose.Types.ObjectId;
  // Student-specific fields
  rollNumber?: string;
  batch?: number;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  cgpa?: number;
  activeBacklogs?: number;
  skills?: string[];
  resume?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verificationRemarks?: string;
  placementStatus?: 'unplaced' | 'placed';
  placedCompany?: mongoose.Types.ObjectId;
  resetOtp?: string;
  resetOtpExpiry?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: Object.values(Role), required: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    // Student-specific
    rollNumber: { type: String, trim: true },
    batch: { type: Number },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String, trim: true },
    tenthPercentage: { type: Number, min: 0, max: 100 },
    twelfthPercentage: { type: Number, min: 0, max: 100 },
    cgpa: { type: Number, min: 0, max: 10 },
    activeBacklogs: { type: Number, default: 0, min: 0 },
    skills: [{ type: String, trim: true }],
    resume: { type: String },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationRemarks: { type: String },
    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed'],
      default: 'unplaced',
    },
    placedCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);