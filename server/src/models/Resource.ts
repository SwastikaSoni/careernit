import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
    title: string;
    resourceType: 'pdf' | 'link' | 'article';
    category: string;
    description?: string;
    content?: string;
    url?: string;
    filePath?: string;
    company?: mongoose.Types.ObjectId;
    tags: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
    {
        title: { type: String, required: true, trim: true },
        resourceType: {
            type: String,
            enum: ['pdf', 'link', 'article'],
            required: true,
            default: 'link',
        },
        category: {
            type: String,
            enum: ['aptitude', 'technical', 'coding', 'hr', 'soft_skills', 'resume', 'other'],
            default: 'other',
        },
        description: { type: String, trim: true },
        content: { type: String },           // for type 'article'
        url: { type: String, trim: true },    // for type 'link'
        filePath: { type: String },           // for type 'pdf'
        company: { type: Schema.Types.ObjectId, ref: 'Company' },
        tags: [{ type: String, trim: true }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

resourceSchema.index({ category: 1, resourceType: 1 });

export default mongoose.model<IResource>('Resource', resourceSchema);
