import mongoose, { Schema, Document } from 'mongoose';

export interface IEligibility {
  departments?: mongoose.Types.ObjectId[];
  minCGPA?: number;
  maxBacklogs?: number;
  minTenthPercentage?: number;
  minTwelfthPercentage?: number;
  batch?: number;
}

export interface IDrive extends Document {
  title: string;
  company: mongoose.Types.ObjectId;
  description?: string;
  location?: string;
  driveDate?: Date;
  lastDateToApply: Date;
  packageLPA?: number;
  jobType: 'full_time' | 'internship' | 'both';
  eligibility: IEligibility;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const driveSchema = new Schema<IDrive>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    driveDate: { type: Date },
    lastDateToApply: { type: Date, required: true },
    packageLPA: { type: Number, min: 0 },
    jobType: {
      type: String,
      enum: ['full_time', 'internship', 'both'],
      default: 'full_time',
    },
    eligibility: {
      departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
      minCGPA: { type: Number, min: 0, max: 10 },
      maxBacklogs: { type: Number, min: 0 },
      minTenthPercentage: { type: Number, min: 0, max: 100 },
      minTwelfthPercentage: { type: Number, min: 0, max: 100 },
      batch: { type: Number },
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDrive>('Drive', driveSchema);
