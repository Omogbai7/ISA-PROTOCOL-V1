import Group from '../models/Group.js';
import User from '../models/User.js';
import { countMentions, isSpam, containsLinks } from '../utils/helpers.js';

export class GroupService {
  // Create or update group
  static async upsertGroup(groupId, name, admins = []) {
    let group = await Group.findOne({ groupId });

    if (!group) {
      group = new Group({
        groupId,
        name,
        admins
      });
    } else {
      group.name = name;
      group.admins = admins;
      group.lastActive = new Date();
    }

    await group.save();
    return group;
  }

  // Get group by ID
  static async getGroup(groupId) {
    return await Group.findOne({ groupId });
  }

  // Update group settings
  static async updateSettings(groupId, settings) {
    const group = await Group.findOne({ groupId });

    if (!group) {
      throw new Error('Group not found');
    }

    // Merge settings
    group.settings = {
      ...group.settings,
      ...settings
    };

    await group.save();
    return group;
  }

  // Check if message violates anti-tag rules
  static async checkAntiTag(groupId, message) {
    const group = await Group.findOne({ groupId });

    if (!group || !group.settings.antiTag.enabled) {
      return { violated: false };
    }

    const mentionCount = countMentions(message);

    if (mentionCount > group.settings.antiTag.maxMentions) {
      return {
        violated: true,
        action: group.settings.antiTag.action,
        mentionCount
      };
    }

    return { violated: false };
  }

  // Check if message should be auto-deleted
  static async checkAutoDelete(groupId, message) {
    const group = await Group.findOne({ groupId });

    if (!group || !group.settings.autoDelete.enabled) {
      return { shouldDelete: false };
    }

    const reasons = [];

    if (group.settings.autoDelete.deleteLinks && containsLinks(message)) {
      reasons.push('contains links');
    }

    if (group.settings.autoDelete.deleteSpam && isSpam(message)) {
      reasons.push('spam detected');
    }

    return {
      shouldDelete: reasons.length > 0,
      reasons
    };
  }

  // Add warning to user
  static async addWarning(groupId, phoneNumber, reason) {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      throw new Error('User not found');
    }

    await user.addWarning();

    const group = await Group.findOne({ groupId });
    if (group) {
      await group.incrementStats('totalWarnings');
    }

    return {
      user,
      totalWarnings: user.warnings,
      shouldKick: group?.settings.autoKick.enabled &&
                  user.warnings >= group.settings.autoKick.warningThreshold
    };
  }

  // Ban user from group
  static async banUser(groupId, phoneNumber, reason) {
    const group = await Group.findOne({ groupId });

    if (!group) {
      throw new Error('Group not found');
    }

    await group.banUser(phoneNumber, reason);

    const user = await User.findOne({ phoneNumber });
    if (user) {
      user.isBanned = true;
      user.banReason = reason;
      await user.save();
    }

    return group;
  }

  // Unban user from group
  static async unbanUser(groupId, phoneNumber) {
    const group = await Group.findOne({ groupId });

    if (!group) {
      throw new Error('Group not found');
    }

    await group.unbanUser(phoneNumber);

    const user = await User.findOne({ phoneNumber });
    if (user) {
      user.isBanned = false;
      user.banReason = null;
      await user.save();
    }

    return group;
  }

  // Check if user is banned
  static async isUserBanned(groupId, phoneNumber) {
    const group = await Group.findOne({ groupId });

    if (!group) {
      return false;
    }

    return group.isUserBanned(phoneNumber);
  }

  // Get group statistics
  static async getStatistics(groupId) {
    const group = await Group.findOne({ groupId });

    if (!group) {
      throw new Error('Group not found');
    }

    return {
      ...group.statistics,
      settings: group.settings,
      totalBanned: group.bannedUsers.length,
      totalAdmins: group.admins.length
    };
  }

  // Increment message count
  static async incrementMessageCount(groupId) {
    const group = await Group.findOne({ groupId });

    if (group) {
      await group.incrementStats('totalMessages');
    }
  }
}
