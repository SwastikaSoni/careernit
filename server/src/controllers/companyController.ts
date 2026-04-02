import { Response, NextFunction } from 'express';
import Company from '../models/Company';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/companies
export const getAllCompanies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, industry } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    if (industry) filter.industry = industry;

    const companies = await Company.find(filter).sort({ name: 1 });
    res.json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

// GET /api/companies/:id
export const getCompanyById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) throw createError(404, 'Company not found');
    res.json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

// POST /api/companies
export const createCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Company.findOne({ name: req.body.name });
    if (existing) throw createError(400, 'Company with this name already exists');

    const company = await Company.create({
      ...req.body,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/companies/:id
export const updateCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) throw createError(404, 'Company not found');

    if (req.body.name && req.body.name !== company.name) {
      const existing = await Company.findOne({ name: req.body.name, _id: { $ne: req.params.id as string } });
      if (existing) throw createError(400, 'Company name already exists');
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Company updated successfully',
      company: updated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/companies/:id
export const deleteCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) throw createError(404, 'Company not found');

    await Company.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    next(error);
  }
};