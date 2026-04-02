import { Response, NextFunction } from 'express';
import MockTest from '../models/MockTest';
import TestAttempt from '../models/TestAttempt';
import Question from '../models/Question';
import { AuthRequest } from '../types';
import { createError } from '../middlewares/errorHandler';

// GET /api/mock-tests
export const getAllMockTests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { testType, search } = req.query;
        const filter: any = {};

        // Students only see published tests
        if (req.user?.role === 'student') filter.isPublished = true;
        if (testType) filter.testType = testType;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const tests = await MockTest.find(filter)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        // For students, include their attempt info
        let attempts: any[] = [];
        if (req.user?.role === 'student') {
            attempts = await TestAttempt.find({ student: req.user._id })
                .select('test status totalScore percentage submittedAt');
        }

        res.json({ success: true, tests, attempts });
    } catch (error) {
        next(error);
    }
};

// GET /api/mock-tests/:id
export const getMockTestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const test = await MockTest.findById(req.params.id)
            .populate({
                path: 'questions',
                populate: { path: 'company', select: 'name' },
            })
            .populate('createdBy', 'name');

        if (!test) throw createError(404, 'Mock test not found');

        // Students can only see published tests
        if (req.user?.role === 'student' && !test.isPublished) {
            throw createError(403, 'This test is not available');
        }

        res.json({ success: true, test });
    } catch (error) {
        next(error);
    }
};

// POST /api/mock-tests
export const createMockTest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const test = await MockTest.create({
            ...req.body,
            createdBy: req.user?._id,
        });

        const populated = await MockTest.findById(test._id)
            .populate('questions')
            .populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            message: 'Mock test created successfully',
            test: populated,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/mock-tests/:id
export const updateMockTest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const test = await MockTest.findById(req.params.id);
        if (!test) throw createError(404, 'Mock test not found');

        const updated = await MockTest.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate('questions')
            .populate('createdBy', 'name');

        // Real-time notification when test is published
        if (req.body.isPublished && !test.isPublished && updated) {
            try {
                const { emitToAll } = require('../services/socketService');
                emitToAll('test_published', { title: updated.title, _id: updated._id });
            } catch (_) { /* socket not initialized */ }
        }

        res.json({
            success: true,
            message: 'Mock test updated successfully',
            test: updated,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/mock-tests/:id
export const deleteMockTest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const test = await MockTest.findById(req.params.id);
        if (!test) throw createError(404, 'Mock test not found');

        await MockTest.findByIdAndDelete(req.params.id);
        await TestAttempt.deleteMany({ test: req.params.id });

        res.json({ success: true, message: 'Mock test deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// POST /api/mock-tests/:id/start — Student starts a test
export const startAttempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const test = await MockTest.findById(req.params.id).populate({
            path: 'questions',
            select: 'title questionType category difficulty options.text codingDetails.problemStatement codingDetails.constraints codingDetails.sampleInput codingDetails.sampleOutput codingDetails.languages',
        });
        if (!test) throw createError(404, 'Mock test not found');
        if (!test.isPublished) throw createError(400, 'This test is not available');

        // Check if student already has an in-progress attempt
        const existing = await TestAttempt.findOne({
            test: req.params.id,
            student: req.user?._id,
            status: 'in_progress',
        });

        if (existing) {
            // Resume existing attempt
            return res.json({ success: true, attempt: existing, test }) as any;
        }

        // Create new attempt
        const attempt = await TestAttempt.create({
            test: req.params.id as string,
            student: req.user?._id,
            startedAt: new Date(),
            answers: test.questions.map((q: any) => ({
                question: q._id,
                isCorrect: false,
                marksAwarded: 0,
            })),
        });

        res.status(201).json({ success: true, attempt, test });
    } catch (error) {
        next(error);
    }
};

// PUT /api/mock-tests/:id/submit — Student submits a test
export const submitAttempt = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { attemptId, answers } = req.body;

        const attempt = await TestAttempt.findById(attemptId);
        if (!attempt) throw createError(404, 'Attempt not found');
        if (attempt.student.toString() !== req.user?._id) {
            throw createError(403, 'Access denied');
        }
        if (attempt.status === 'submitted') {
            throw createError(400, 'Test already submitted');
        }

        const test = await MockTest.findById(attempt.test);
        if (!test) throw createError(404, 'Mock test not found');

        // Fetch full questions with answers for scoring
        const questions = await Question.find({
            _id: { $in: test.questions.map((q: any) => q.toString()) },
        });

        const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
        const marksPerQuestion = test.totalMarks / test.questions.length;

        let totalScore = 0;
        const scoredAnswers = (answers || []).map((ans: any) => {
            const question = questionMap.get(ans.question);
            if (!question) return { ...ans, isCorrect: false, marksAwarded: 0 };

            let isCorrect = false;
            let marksAwarded = 0;

            if (question.questionType === 'aptitude') {
                // Check if selected option is correct
                if (ans.selectedOption !== undefined && question.options[ans.selectedOption]?.isCorrect) {
                    isCorrect = true;
                    marksAwarded = marksPerQuestion;
                }
            } else if (question.questionType === 'coding') {
                // Basic string comparison against test cases
                if (ans.code && question.codingDetails?.testCases) {
                    // For now, we'll mark coding as manual review (0 marks auto)
                    // In a production system, this would run the code against test cases
                    isCorrect = false;
                    marksAwarded = 0;
                }
            }

            totalScore += marksAwarded;
            return {
                question: ans.question,
                selectedOption: ans.selectedOption,
                code: ans.code,
                language: ans.language,
                isCorrect,
                marksAwarded,
            };
        });

        attempt.answers = scoredAnswers;
        attempt.totalScore = totalScore;
        attempt.percentage = Math.round((totalScore / test.totalMarks) * 100);
        attempt.status = 'submitted';
        attempt.submittedAt = new Date();
        await attempt.save();

        res.json({
            success: true,
            message: 'Test submitted successfully',
            attempt,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/mock-tests/attempts/:attemptId — Get attempt result
export const getAttemptResult = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const attempt = await TestAttempt.findById(req.params.attemptId)
            .populate({
                path: 'test',
                select: 'title description duration totalMarks passingMarks testType',
            })
            .populate({
                path: 'answers.question',
                populate: { path: 'company', select: 'name' },
            });

        if (!attempt) throw createError(404, 'Attempt not found');

        // Students can only view their own attempts
        if (req.user?.role === 'student' && attempt.student.toString() !== req.user._id) {
            throw createError(403, 'Access denied');
        }

        res.json({ success: true, attempt });
    } catch (error) {
        next(error);
    }
};

// GET /api/mock-tests/my-attempts — Student's all attempts
export const getMyAttempts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const attempts = await TestAttempt.find({ student: req.user?._id })
            .populate('test', 'title testType duration totalMarks passingMarks')
            .sort({ createdAt: -1 });

        res.json({ success: true, attempts });
    } catch (error) {
        next(error);
    }
};
