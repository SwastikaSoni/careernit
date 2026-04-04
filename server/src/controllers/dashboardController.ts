import { Response, NextFunction } from 'express';
import { AuthRequest, Role } from '../types';
import User from '../models/User';
import Department from '../models/Department';
import Company from '../models/Company';
import { createError } from '../middlewares/errorHandler';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) throw createError(401, 'Not authenticated');

    // Import the models needed for real stats
    const Drive = require('../models/Drive').default;
    const Application = require('../models/Application').default;
    const Interview = require('../models/Interview').default;
    const Offer = require('../models/Offer').default;
    const TestAttempt = require('../models/TestAttempt').default;

    if (user.role === Role.ADMIN || user.role === Role.PLACEMENT_OFFICER) {
      // Common officer/admin stats
      const totalStudents = await User.countDocuments({ role: Role.STUDENT, verificationStatus: 'verified' });
      const placedStudents = await User.countDocuments({ role: Role.STUDENT, placementStatus: 'placed' });
      const totalCompanies = await Company.countDocuments();
      const totalDrives = await Drive.countDocuments();
      const activeDrives = await Drive.countDocuments({ status: { $in: ['active', 'ongoing'] } });
      const totalApplications = await Application.countDocuments();
      const upcomingInterviews = await Interview.countDocuments({ status: 'scheduled' });
      const pendingOffers = await Offer.countDocuments({ status: 'pending' });

      // Chart Data: Placement Ratio
      const placementStats = [
        { name: 'Placed', value: placedStudents },
        { name: 'Unplaced', value: Math.max(0, totalStudents - placedStudents) }
      ];

      // Chart Data: Applications per recent active drive (limit 5)
      const driveStats = await Drive.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'drive',
            as: 'applicants'
          }
        },
        {
          $project: {
            name: '$title',
            Applications: { $size: '$applicants' }
          }
        }
      ]);

      if (user.role === Role.ADMIN) {
        const pendingVerifications = await User.countDocuments({ role: Role.STUDENT, verificationStatus: 'pending' });
        const rejectedStudents = await User.countDocuments({ role: Role.STUDENT, verificationStatus: 'rejected' });
        const totalOfficers = await User.countDocuments({ role: Role.PLACEMENT_OFFICER });
        const totalDepartments = await Department.countDocuments();

        res.json({
          success: true,
          stats: {
            totalStudents,
            verifiedStudents: totalStudents,
            pendingVerifications,
            rejectedStudents,
            placedStudents,
            totalOfficers,
            totalDepartments,
            totalCompanies,
            totalDrives,
            activeDrives,
            totalApplications,
            pendingOffers,
            upcomingInterviews,
            placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
            placementStats,
            driveStats
          },
        });
      } else {
        res.json({
          success: true,
          stats: {
            totalCompanies,
            totalDrives,
            activeDrives,
            totalApplications,
            upcomingInterviews,
            pendingOffers,
            totalStudents,
            placedStudents,
            placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
            placementStats,
            driveStats
          },
        });
      }
    } else if (user.role === Role.STUDENT) {
      const student = await User.findById(user._id);

      const myApplications = await Application.countDocuments({ student: user._id });
      const upcomingInterviews = await Interview.countDocuments({ student: user._id, status: 'scheduled' });
      const eligibleDrives = await Drive.countDocuments({ status: { $in: ['active', 'ongoing'] } }); // Simplified

      const offersReceived = await Offer.countDocuments({ student: user._id });
      const mockTestsTaken = await TestAttempt.countDocuments({ student: user._id });

      // Chart Data: Applications status
      const apps = await Application.find({ student: user._id });
      const statusCounts = apps.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      const applicationStats = [
        { name: 'Applied', value: statusCounts.applied || 0 },
        { name: 'Shortlisted', value: statusCounts.shortlisted || 0 },
        { name: 'Selected', value: statusCounts.selected || 0 },
        { name: 'Rejected', value: statusCounts.rejected || 0 }
      ].filter(item => item.value > 0);

      res.json({
        success: true,
        stats: {
          verificationStatus: student?.verificationStatus || 'pending',
          placementStatus: student?.placementStatus || 'unplaced',
          myApplications,
          upcomingInterviews,
          offersReceived,
          mockTestsTaken,
          eligibleDrives,
          applicationStats
        },
      });
    }
  } catch (error) {
    next(error);
  }
};