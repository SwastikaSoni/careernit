import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
    student: mongoose.Types.ObjectId;
    drive: mongoose.Types.ObjectId;
    company: mongoose.Types.ObjectId;
    ctc: number;
    offerLetterUrl?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'revoked';
    rejectedReason?: string;
    issuedAt: Date;
    respondedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
    {
        student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        drive: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
        company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
        ctc: { type: Number, required: true },
        offerLetterUrl: { type: String },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'revoked'],
            default: 'pending'
        },
        rejectedReason: { type: String },
        issuedAt: { type: Date, default: Date.now },
        respondedAt: { type: Date }
    },
    { timestamps: true }
);

// A student can receive ideally one offer per drive, or maybe multiple if allowed, but usually one.
offerSchema.index({ student: 1, drive: 1 }, { unique: true });

export default mongoose.model<IOffer>('Offer', offerSchema);
