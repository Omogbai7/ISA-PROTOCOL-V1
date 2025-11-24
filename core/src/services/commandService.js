import User from '../models/User.js';
import Group from '../models/Group.js';
import CommandLog from '../models/CommandLog.js';
import { GroupService } from './groupService.js';
import { PremiumService } from './premiumService.js';
import { chunkArray, sleep } from '../utils/helpers.js';

export class CommandService {
  // Log command execution
  static async logCommand(commandData) {
    const log = new CommandLog(commandData);
    await log.save();
    return log;
  }

  // Execute command based on command name
  static async executeCommand(commandName, context) {
    const startTime = Date.now();

    try {
      let result;

      switch (commandName) {
        case 'menu':
          result = await this.handleMenu(context);
          break;
        case 'ping':
          result = await this.handlePing(context);
          break;
        case 'tagall':
          result = await this.handleTagAll(context);
          break;
        case 'antitag':
          result = await this.handleAntiTag(context);
          break;
        case 'warn':
          result = await this.handleWarn(context);
          break;
        case 'kick':
          result = await this.handleKick(context);
          break;
        case 'ban':
          result = await this.handleBan(context);
          break;
        case 'unban':
          result = await this.handleUnban(context);
          break;
        case 'search':
          result = await this.handleSearch(context);
          break;
        case 'anonymous':
          result = await this.handleAnonymous(context);
          break;
        case 'upgrade':
          result = await this.handleUpgrade(context);
          break;
        case 'activate':
          result = await this.handleActivate(context);
          break;
        case 'status':
          result = await this.handleStatus(context);
          break;
        case 'ghost':
          result = await this.handleGhost(context);
          break;
        default:
          result = { message: 'Unknown command' };
      }

      const executionTime = Date.now() - startTime;

      await this.logCommand({
        command: commandName,
        user: context.user,
        group: context.group,
        args: context.args,
        success: true,
        executionTime
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      await this.logCommand({
        command: commandName,
        user: context.user,
        group: context.group,
        args: context.args,
        success: false,
        error: error.message,
        executionTime
      });

      throw error;
    }
  }

  // Command handlers
  static async handleMenu(context) {
    const { user } = context;

    if (!user.isOwner) {
      return { message: null, silent: false }; // Silent mode for non-owners
    }

    const menu = `
╔══════════════════════╗
║   ISA PROTOCOL V1    ║
╚══════════════════════╝

🎯 *Group Management*
├ .tagall <message> - Tag all members
├ .antitag on/off - Toggle anti-tag
├ .warn @user - Warn user
├ .kick @user - Kick user
└ .ban @user - Ban user

💎 *Premium Features*
├ .upgrade - Get premium info
├ .activate <code> - Activate license
└ .status - View your status

🎮 *Engagement*
├ .search <query> - Web search
├ .anonymous <msg> - Anonymous post
└ .ghost on/off - Toggle ghost mode

📊 *Analytics* (Owner Only)
└ .status - View statistics

⚡ Powered by Isa Protocol
`;

    return { message: menu, animation: true };
  }

  static async handlePing(context) {
    return { message: '🏓 Pong! Bot is active.' };
  }

  static async handleTagAll(context) {
    const { user, group, args, participants } = context;

    // Check permissions
    if (!user.isOwner && !user.isAdmin && !group.admins.includes(user.phoneNumber)) {
      return { message: '❌ You need admin permissions to use this command.' };
    }

    const message = args.join(' ') || 'Attention everyone!';

    // Chunk participants to avoid spam detection
    const chunks = chunkArray(participants, 5);
    const mentions = [];

    for (const chunk of chunks) {
      mentions.push(...chunk);
      await sleep(1000); // Delay between chunks
    }

    return {
      message,
      mentions,
      chunked: true
    };
  }

  static async handleAntiTag(context) {
    const { user, group, args } = context;

    if (!user.isOwner && !user.isAdmin) {
      return { message: '❌ Admin permission required.' };
    }

    const action = args[0]?.toLowerCase();

    if (action !== 'on' && action !== 'off') {
      return { message: '❌ Usage: .antitag on/off' };
    }

    const enabled = action === 'on';

    await GroupService.updateSettings(group.groupId, {
      antiTag: {
        enabled,
        maxMentions: 5,
        action: 'warn'
      }
    });

    return { message: `✅ Anti-tag ${enabled ? 'enabled' : 'disabled'}` };
  }

  static async handleWarn(context) {
    const { user, group, args, mentionedUsers } = context;

    if (!user.isOwner && !user.isAdmin) {
      return { message: '❌ Admin permission required.' };
    }

    if (!mentionedUsers || mentionedUsers.length === 0) {
      return { message: '❌ Please mention a user to warn.' };
    }

    const targetPhone = mentionedUsers[0];
    const reason = args.slice(1).join(' ') || 'Rule violation';

    const result = await GroupService.addWarning(group.groupId, targetPhone, reason);

    let message = `⚠️ Warning issued to @${targetPhone}\n`;
    message += `Total warnings: ${result.totalWarnings}`;

    if (result.shouldKick) {
      message += `\n🚫 User will be kicked (threshold reached)`;
    }

    return { message, shouldKick: result.shouldKick, targetPhone };
  }

  static async handleKick(context) {
    const { user, mentionedUsers } = context;

    if (!user.isOwner && !user.isAdmin) {
      return { message: '❌ Admin permission required.' };
    }

    if (!mentionedUsers || mentionedUsers.length === 0) {
      return { message: '❌ Please mention a user to kick.' };
    }

    return {
      action: 'kick',
      targetPhone: mentionedUsers[0],
      message: `✅ User kicked from group.`
    };
  }

  static async handleBan(context) {
    const { user, group, args, mentionedUsers } = context;

    if (!user.isOwner) {
      return { message: '❌ Owner permission required.' };
    }

    if (!mentionedUsers || mentionedUsers.length === 0) {
      return { message: '❌ Please mention a user to ban.' };
    }

    const targetPhone = mentionedUsers[0];
    const reason = args.slice(1).join(' ') || 'Banned by owner';

    await GroupService.banUser(group.groupId, targetPhone, reason);

    return {
      action: 'ban',
      targetPhone,
      message: `🚫 User permanently banned.`
    };
  }

  static async handleUnban(context) {
    const { user, group, mentionedUsers } = context;

    if (!user.isOwner) {
      return { message: '❌ Owner permission required.' };
    }

    if (!mentionedUsers || mentionedUsers.length === 0) {
      return { message: '❌ Please mention a user to unban.' };
    }

    await GroupService.unbanUser(group.groupId, mentionedUsers[0]);

    return { message: `✅ User unbanned.` };
  }

  static async handleSearch(context) {
    const { args } = context;

    if (args.length === 0) {
      return { message: '❌ Usage: .search <query>' };
    }

    const query = args.join(' ');

    // Placeholder - integrate with real search API
    return {
      message: `🔍 Search results for: "${query}"\n\n` +
               `This feature requires integration with a search API.\n` +
               `Contact owner to enable web search.`
    };
  }

  static async handleAnonymous(context) {
    const { args } = context;

    if (args.length === 0) {
      return { message: '❌ Usage: .anonymous <message>' };
    }

    const anonymousMsg = args.join(' ');

    return {
      message: `📢 *Anonymous Message*\n\n${anonymousMsg}`,
      anonymous: true
    };
  }

  static async handleUpgrade(context) {
    return {
      message: `💎 *Premium Subscription*\n\n` +
               `Unlock advanced features:\n` +
               `✓ Scheduled messages\n` +
               `✓ Advanced automation\n` +
               `✓ AI auto-responses\n` +
               `✓ Analytics dashboard\n\n` +
               `Plans:\n` +
               `• Trial: 7 days - Free\n` +
               `• Monthly: 30 days - $9.99\n` +
               `• Yearly: 365 days - $99.99\n\n` +
               `Contact owner for activation codes.`
    };
  }

  static async handleActivate(context) {
    const { user, args } = context;

    if (args.length === 0) {
      return { message: '❌ Usage: .activate <code>' };
    }

    const code = args[0];

    try {
      const result = await PremiumService.activateLicense(code, user.phoneNumber);
      return { message: `✅ ${result.message}` };
    } catch (error) {
      return { message: `❌ ${error.message}` };
    }
  }

  static async handleStatus(context) {
    const { user, group } = context;

    const premiumStatus = await PremiumService.checkPremiumStatus(user.phoneNumber);

    let message = `📊 *Your Status*\n\n`;
    message += `Phone: ${user.phoneNumber}\n`;
    message += `Role: ${user.isOwner ? 'Owner' : user.isAdmin ? 'Admin' : 'User'}\n`;
    message += `Premium: ${premiumStatus.isPremium ? '✅' : '❌'}\n`;

    if (premiumStatus.isPremium) {
      message += `Expires: ${premiumStatus.daysRemaining} days remaining\n`;
    }

    if (user.isOwner && group) {
      const stats = await GroupService.getStatistics(group.groupId);
      message += `\n📈 *Group Stats*\n`;
      message += `Messages: ${stats.totalMessages}\n`;
      message += `Commands: ${stats.totalCommands}\n`;
      message += `Warnings: ${stats.totalWarnings}\n`;
      message += `Kicks: ${stats.totalKicks}\n`;
    }

    return { message };
  }

  static async handleGhost(context) {
    const { user, group, args } = context;

    if (!user.isOwner) {
      return { message: '❌ Owner permission required.' };
    }

    const action = args[0]?.toLowerCase();

    if (action !== 'on' && action !== 'off') {
      return { message: '❌ Usage: .ghost on/off' };
    }

    const enabled = action === 'on';

    await GroupService.updateSettings(group.groupId, {
      ghostMode: enabled
    });

    return { message: `👻 Ghost mode ${enabled ? 'enabled' : 'disabled'}` };
  }
}
