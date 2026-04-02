import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    drive: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    status: 'applied' | 'shortlisted' | 'rejected' | 'selected';
    appliedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
    {
        drive: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['applied', 'shortlisted', 'rejected', 'selected'],
            default: 'applied',
        },
        appliedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ drive: 1, student: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', applicationSchema);
