import { Response, NextFunction } from 'express';
import Department from '../models/Department';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/departments
export const getAllDepartments = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

// GET /api/departments/:id
export const getDepartmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) throw createError(404, 'Department not found');
    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// POST /api/departments
export const createDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, description } = req.body;

    const existingName = await Department.findOne({ name });
    if (existingName) throw createError(400, 'Department name already exists');

    const existingCode = await Department.findOne({ code: code.toUpperCase() });
    if (existingCode) throw createError(400, 'Department code already exists');

    const department = await Department.create({ name, code: code.toUpperCase(), description });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/departments/:id
export const updateDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, description, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) throw createError(404, 'Department not found');

    if (name && name !== department.name) {
      const existingName = await Department.findOne({ name, _id: { $ne: req.params.id as string } });
      if (existingName) throw createError(400, 'Department name already exists');
    }

    if (code && code.toUpperCase() !== department.code) {
      const existingCode = await Department.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id as string } });
      if (existingCode) throw createError(400, 'Department code already exists');
    }

    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code: code?.toUpperCase(), description, isActive },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Department updated successfully',
      department: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/departments/:id
export const deleteDepartment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) throw createError(404, 'Department not found');

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};