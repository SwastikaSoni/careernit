import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
    question: mongoose.Types.ObjectId;
    selectedOption?: number;
    code?: string;
    language?: string;
    isCorrect: boolean;
    marksAwarded: number;
}

export interface ITestAttempt extends Document {
    test: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    startedAt: Date;
    submittedAt?: Date;
    status: 'in_progress' | 'submitted' | 'timed_out';
    answers: IAnswer[];
    totalScore: number;
    percentage: number;
    createdAt: Date;
    updatedAt: Date;
}

const testAttemptSchema = new Schema<ITestAttempt>(
    {
        test: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true },
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        startedAt: { type: Date, default: Date.now },
        submittedAt: { type: Date },
        status: {
            type: String,
            enum: ['in_progress', 'submitted', 'timed_out'],
            default: 'in_progress',
        },
        answers: [
            {
                question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
                selectedOption: { type: Number },
                code: { type: String },
                language: { type: String },
                isCorrect: { type: Boolean, default: false },
                marksAwarded: { type: Number, default: 0 },
            },
        ],
        totalScore: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
    },
    { timestamps: true }
);

testAttemptSchema.index({ test: 1, student: 1 });

export default mongoose.model<ITestAttempt>('TestAttempt', testAttemptSchema);
