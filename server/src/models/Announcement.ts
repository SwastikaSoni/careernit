import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    priority: 'normal' | 'important' | 'urgent';
    targetDepartments: mongoose.Types.ObjectId[];
    targetBatches: number[];
    targetRoles: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
    {
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        priority: {
            type: String,
            enum: ['normal', 'important', 'urgent'],
            default: 'normal',
        },
        targetDepartments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
        targetBatches: [{ type: Number }],
        targetRoles: [{ type: String, enum: ['admin', 'placement_officer', 'student'] }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
