import mongoose, { Schema, Document } from 'mongoose';

export interface IRound {
    roundNumber: number;
    roundType: 'technical' | 'hr' | 'group_discussion' | 'aptitude' | 'coding' | 'other';
    scheduledDate?: Date;
    venue?: string;
    interviewerName?: string;
    result: 'pending' | 'passed' | 'failed';
    feedback?: string;
}

export interface IInterview extends Document {
    drive: mongoose.Types.ObjectId;
    application: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    scheduledBy: mongoose.Types.ObjectId;
    rounds: IRound[];
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const roundSchema = new Schema<IRound>(
    {
        roundNumber: { type: Number, required: true },
        roundType: {
            type: String,
            enum: ['technical', 'hr', 'group_discussion', 'aptitude', 'coding', 'other'],
            required: true,
        },
        scheduledDate: { type: Date },
        venue: { type: String, trim: true },
        interviewerName: { type: String, trim: true },
        result: {
            type: String,
            enum: ['pending', 'passed', 'failed'],
            default: 'pending',
        },
        feedback: { type: String, trim: true },
    },
    { _id: true }
);

const interviewSchema = new Schema<IInterview>(
    {
        drive: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
        application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        scheduledBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rounds: [roundSchema],
        status: {
            type: String,
            enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
            default: 'scheduled',
        },
    },
    { timestamps: true }
);

// Prevent duplicate interviews for same application
interviewSchema.index({ application: 1 }, { unique: true });

export default mongoose.model<IInterview>('Interview', interviewSchema);
