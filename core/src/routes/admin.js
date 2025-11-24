import express from 'express';
import User from '../models/User.js';
import Group from '../models/Group.js';
import CommandLog from '../models/CommandLog.js';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Get analytics dashboard
router.get('/analytics', authenticateApiKey, async (req, res) => {
  try {
    const [
      totalUsers,
      premiumUsers,
      totalGroups,
      totalCommands,
      topCommands,
      topUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      Group.countDocuments(),
      CommandLog.countDocuments(),
      CommandLog.getTopCommands(10),
      CommandLog.getTopUsers(10)
    ]);

    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          premium: premiumUsers,
          free: totalUsers - premiumUsers
        },
        groups: {
          total: totalGroups
        },
        commands: {
          total: totalCommands,
          top: topCommands
        },
        topUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all users
router.get('/users', authenticateApiKey, async (req, res) => {
  try {
    const { page = 1, limit = 50, isPremium, isBanned } = req.query;

    const filters = {};
    if (isPremium !== undefined) filters.isPremium = isPremium === 'true';
    if (isBanned !== undefined) filters.isBanned = isBanned === 'true';

    const users = await User.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user by phone
router.get('/users/:phoneNumber', authenticateApiKey, async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's command history
    const commandHistory = await CommandLog.find({ 'user.phoneNumber': phoneNumber })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      user,
      commandHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user permissions
router.patch('/users/:phoneNumber', authenticateApiKey, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { isOwner, isAdmin, isBanned, banReason } = req.body;

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (isOwner !== undefined) user.isOwner = isOwner;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (isBanned !== undefined) user.isBanned = isBanned;
    if (banReason !== undefined) user.banReason = banReason;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all groups
router.get('/groups', authenticateApiKey, async (req, res) => {
  try {
    const groups = await Group.find()
      .sort({ lastActive: -1 });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get group by ID
router.get('/groups/:groupId', authenticateApiKey, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({ groupId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update group settings
router.patch('/groups/:groupId', authenticateApiKey, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { settings } = req.body;

    const group = await Group.findOne({ groupId });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (settings) {
      group.settings = { ...group.settings, ...settings };
    }

    await group.save();

    res.json({
      success: true,
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get command logs
router.get('/logs/commands', authenticateApiKey, async (req, res) => {
  try {
    const { page = 1, limit = 100, command, phoneNumber } = req.query;

    const filters = {};
    if (command) filters.command = command;
    if (phoneNumber) filters['user.phoneNumber'] = phoneNumber;

    const logs = await CommandLog.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ timestamp: -1 });

    const total = await CommandLog.countDocuments(filters);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
