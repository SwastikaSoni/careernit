import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface ICodingDetails {
    problemStatement: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    testCases: ITestCase[];
    languages: string[];
}

export interface IOption {
    text: string;
    isCorrect: boolean;
}

export interface IQuestion extends Document {
    title: string;
    questionType: 'aptitude' | 'coding';
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    company?: mongoose.Types.ObjectId;
    topic?: string;
    options: IOption[];
    codingDetails?: ICodingDetails;
    explanation?: string;
    tags: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
    {
        title: { type: String, required: true, trim: true },
        questionType: {
            type: String,
            enum: ['aptitude', 'coding'],
            required: true,
            default: 'aptitude',
        },
        category: {
            type: String,
            enum: ['aptitude', 'technical', 'coding', 'hr', 'logical', 'verbal', 'other'],
            default: 'aptitude',
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        company: { type: Schema.Types.ObjectId, ref: 'Company' },
        topic: { type: String, trim: true },
        options: [
            {
                text: { type: String },
                isCorrect: { type: Boolean, default: false },
            },
        ],
        codingDetails: {
            problemStatement: { type: String },
            constraints: { type: String },
            sampleInput: { type: String },
            sampleOutput: { type: String },
            testCases: [
                {
                    input: { type: String },
                    expectedOutput: { type: String },
                    isHidden: { type: Boolean, default: false },
                },
            ],
            languages: [{ type: String }],
        },
        explanation: { type: String },
        tags: [{ type: String, trim: true }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

questionSchema.index({ category: 1, difficulty: 1, questionType: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ company: 1 });

export default mongoose.model<IQuestion>('Question', questionSchema);
