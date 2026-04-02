import mongoose, { Schema, Document } from 'mongoose';

export interface IMockTest extends Document {
    title: string;
    description?: string;
    testType: 'aptitude' | 'coding' | 'mixed';
    questions: mongoose.Types.ObjectId[];
    duration: number;
    totalMarks: number;
    passingMarks: number;
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const mockTestSchema = new Schema<IMockTest>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        testType: {
            type: String,
            enum: ['aptitude', 'coding', 'mixed'],
            default: 'aptitude',
        },
        questions: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
        duration: { type: Number, required: true, min: 1 }, // minutes
        totalMarks: { type: Number, required: true, min: 1 },
        passingMarks: { type: Number, default: 0 },
        isPublished: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IMockTest>('MockTest', mockTestSchema);
