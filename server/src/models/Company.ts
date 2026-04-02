import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industry: string;
  website?: string;
  logo?: string;
  description?: string;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    industry: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    logo: { type: String },
    description: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', companySchema);