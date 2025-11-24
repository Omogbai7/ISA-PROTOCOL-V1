import express from 'express';
import { CommandService } from '../services/commandService.js';
import { GroupService } from '../services/groupService.js';
import User from '../models/User.js';
import { authenticateApiKey } from '../middleware/auth.js';

const router = express.Router();

// Execute command
router.post('/execute', authenticateApiKey, async (req, res) => {
  try {
    const {
      command,
      args = [],
      user: userData,
      group: groupData,
      participants = [],
      mentionedUsers = []
    } = req.body;

    // Ensure user exists in database
    let user = await User.findOne({ phoneNumber: userData.phoneNumber });
    if (!user) {
      user = new User({
        phoneNumber: userData.phoneNumber,
        name: userData.name || ''
      });
      await user.save();
    }

    // Update last active
    user.lastActive = new Date();
    user.commandCount += 1;
    await user.save();

    // Check if user is banned
    if (user.isBanned) {
      return res.json({
        success: false,
        message: `🚫 You are banned. Reason: ${user.banReason || 'No reason provided'}`
      });
    }

    // Check if user is banned from group
    if (groupData) {
      const isBanned = await GroupService.isUserBanned(groupData.groupId, user.phoneNumber);
      if (isBanned) {
        return res.json({
          success: false,
          message: '🚫 You are banned from this group.'
        });
      }
    }

    // Build context
    const context = {
      user,
      group: groupData,
      args,
      participants,
      mentionedUsers
    };

    // Execute command
    const result = await CommandService.executeCommand(command, context);

    // If ghost mode is enabled and user is not owner, return silent response
    if (groupData && !user.isOwner) {
      const group = await GroupService.getGroup(groupData.groupId);
      if (group?.settings.ghostMode && result.silent) {
        return res.json({
          success: true,
          silent: true
        });
      }
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Process incoming message (for auto-moderation)
router.post('/process-message', authenticateApiKey, async (req, res) => {
  try {
    const {
      message,
      user: userData,
      group: groupData
    } = req.body;

    if (!groupData) {
      return res.json({ success: true, actions: [] });
    }

    const actions = [];

    // Check anti-tag
    const antiTagResult = await GroupService.checkAntiTag(groupData.groupId, message);
    if (antiTagResult.violated) {
      actions.push({
        type: 'anti-tag',
        action: antiTagResult.action,
        data: antiTagResult
      });
    }

    // Check auto-delete
    const autoDeleteResult = await GroupService.checkAutoDelete(groupData.groupId, message);
    if (autoDeleteResult.shouldDelete) {
      actions.push({
        type: 'auto-delete',
        reasons: autoDeleteResult.reasons
      });
    }

    // Increment message count
    await GroupService.incrementMessageCount(groupData.groupId);

    res.json({
      success: true,
      actions
    });
  } catch (error) {
    console.error('Message processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
