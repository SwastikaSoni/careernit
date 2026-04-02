import { Response, NextFunction } from 'express';
import Resource from '../models/Resource';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/resources
export const getAllResources = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { category, resourceType, search } = req.query;
        const filter: any = {};

        if (category) filter.category = category;
        if (resourceType) filter.resourceType = resourceType;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        const resources = await Resource.find(filter)
            .populate('company', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, resources });
    } catch (error) {
        next(error);
    }
};

// GET /api/resources/:id
export const getResourceById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('company', 'name')
            .populate('createdBy', 'name');

        if (!resource) throw createError(404, 'Resource not found');
        res.json({ success: true, resource });
    } catch (error) {
        next(error);
    }
};

// POST /api/resources
export const createResource = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const body: any = { ...req.body, createdBy: req.user?._id };

        // If PDF was uploaded via multer
        if (req.file) {
            body.filePath = `/uploads/resources/${req.file.filename}`;
            body.resourceType = 'pdf';
        }

        const resource = await Resource.create(body);
        const populated = await Resource.findById(resource._id)
            .populate('company', 'name')
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            resource: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/resources/:id
export const updateResource = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) throw createError(404, 'Resource not found');

        const body: any = { ...req.body };
        if (req.file) {
            body.filePath = `/uploads/resources/${req.file.filename}`;
        }

        const updated = await Resource.findByIdAndUpdate(req.params.id, body, {
            new: true,
            runValidators: true,
        })
            .populate('company', 'name')
            .populate('createdBy', 'name');

        res.json({
            success: true,
            message: 'Resource updated successfully',
            resource: updated,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/resources/:id
export const deleteResource = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) throw createError(404, 'Resource not found');

        await Resource.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        next(error);
    }
};
