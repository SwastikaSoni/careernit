import { Response, NextFunction } from 'express';
import Question from '../models/Question';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/questions
export const getAllQuestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { category, difficulty, questionType, company, topic, search } = req.query;
        const filter: any = {};

        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (questionType) filter.questionType = questionType;
        if (company) filter.company = company;
        if (topic) filter.topic = { $regex: topic, $options: 'i' };
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { topic: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        // Students should not see correct answers
        const isStudent = req.user?.role === 'student';
        const projection = isStudent
            ? { 'options.isCorrect': 0, explanation: 0, 'codingDetails.testCases': 0 }
            : {};

        const questions = await Question.find(filter, projection)
            .populate('company', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, questions });
    } catch (error) {
        next(error);
    }
};

// GET /api/questions/:id
export const getQuestionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const isStudent = req.user?.role === 'student';
        const projection = isStudent
            ? { 'options.isCorrect': 0, explanation: 0, 'codingDetails.testCases': 0 }
            : {};

        const question = await Question.findById(req.params.id, projection)
            .populate('company', 'name')
            .populate('createdBy', 'name');

        if (!question) throw createError(404, 'Question not found');
        res.json({ success: true, question });
    } catch (error) {
        next(error);
    }
};

// POST /api/questions
export const createQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const question = await Question.create({
            ...req.body,
            createdBy: req.user?._id,
        });

        const populated = await Question.findById(question._id)
            .populate('company', 'name')
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            question: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/questions/:id
export const updateQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) throw createError(404, 'Question not found');

        const updated = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate('company', 'name')
            .populate('createdBy', 'name');

        res.json({
            success: true,
            message: 'Question updated successfully',
            question: updated,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/questions/:id
export const deleteQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) throw createError(404, 'Question not found');

        await Question.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        next(error);
    }
};
