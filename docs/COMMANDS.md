# Command Reference

Complete guide to all available bot commands.

---

## 🎯 Command Prefix

All commands start with a period (`.`)

Example: `.ping`

---

## 📋 General Commands

### .menu
**Access**: Owner only
**Usage**: `.menu`
**Description**: Display full animated menu with all available commands

**Features**:
- Animated loading effect
- Categorized command list
- Premium status indicator
- Only visible to bot owner

---

### .ping
**Access**: Public
**Usage**: `.ping`
**Description**: Check if bot is online and responsive

**Response**:
```
🏓 Pong! Bot is active.
```

---

### .status
**Access**: Public
**Usage**: `.status`
**Description**: View your user status and statistics

**Owner View**:
```
📊 Your Status

Phone: 1234567890
Role: Owner
Premium: ✅
Expires: 30 days remaining

📈 Group Stats
Messages: 1,254
Commands: 342
Warnings: 12
Kicks: 3
```

**User View**:
```
📊 Your Status

Phone: 1234567890
Role: User
Premium: ❌
```

---

## 🛡️ Group Management

### .tagall
**Access**: Admin, Owner
**Usage**: `.tagall [message]`
**Description**: Tag all group members with optional message

**Examples**:
```
.tagall Good morning everyone!
.tagall Meeting in 5 minutes
.tagall
```

**Features**:
- Chunks mentions to avoid spam detection
- Delays between batches
- Works even without admin rights

---

### .antitag
**Access**: Admin, Owner
**Usage**: `.antitag <on|off>`
**Description**: Toggle anti-tag protection

**Examples**:
```
.antitag on   # Enable protection
.antitag off  # Disable protection
```

**When Enabled**:
- Deletes messages with >5 mentions
- Issues warning to sender
- Can auto-kick after threshold

**Configuration**:
```javascript
{
  maxMentions: 5,
  action: 'warn' | 'delete' | 'kick'
}
```

---

### .warn
**Access**: Admin, Owner
**Usage**: `.warn @user [reason]`
**Description**: Issue warning to a user

**Examples**:
```
.warn @1234567890
.warn @1234567890 Spamming
.warn @1234567890 Violating group rules
```

**Response**:
```
⚠️ Warning issued to @1234567890
Total warnings: 2
```

**Auto-Kick**:
If warnings reach threshold (default: 3), user is automatically kicked.

---

### .kick
**Access**: Admin, Owner
**Usage**: `.kick @user`
**Description**: Remove user from group

**Examples**:
```
.kick @1234567890
```

**Response**:
```
✅ User kicked from group.
```

**Requirements**:
- Bot must be admin
- Target must not be admin

---

### .ban
**Access**: Owner only
**Usage**: `.ban @user [reason]`
**Description**: Permanently ban user from group

**Examples**:
```
.ban @1234567890
.ban @1234567890 Repeated violations
```

**Response**:
```
🚫 User permanently banned.
```

**Effects**:
- User is removed
- Cannot rejoin group
- Recorded in database

---

### .unban
**Access**: Owner only
**Usage**: `.unban @user`
**Description**: Remove ban from user

**Examples**:
```
.unban @1234567890
```

**Response**:
```
✅ User unbanned.
```

---

## 💎 Premium Commands

### .upgrade
**Access**: Public
**Usage**: `.upgrade`
**Description**: View premium subscription plans

**Response**:
```
💎 Premium Subscription

Unlock advanced features:
✓ Scheduled messages
✓ Advanced automation
✓ AI auto-responses
✓ Analytics dashboard

Plans:
• Trial: 7 days - Free
• Monthly: 30 days - $9.99
• Yearly: 365 days - $99.99

Contact owner for activation codes.
```

---

### .activate
**Access**: Public
**Usage**: `.activate <code>`
**Description**: Activate premium license

**Examples**:
```
.activate ISA-ABCD1234-XYZ789
```

**Success Response**:
```
✅ Premium activated successfully! Valid for 30 days.
```

**Error Responses**:
```
❌ Invalid license code
❌ License already activated
❌ License has expired
```

---

## 🎮 Engagement Commands

### .search
**Access**: Public
**Usage**: `.search <query>`
**Description**: Search the web

**Examples**:
```
.search WhatsApp bot development
.search weather in New York
.search latest tech news
```

**Note**: Requires integration with search API (future feature)

---

### .anonymous
**Access**: Public
**Usage**: `.anonymous <message>`
**Description**: Post anonymous message in group

**Examples**:
```
.anonymous I think we should change the meeting time
.anonymous Great job everyone!
```

**Response**:
```
📢 Anonymous Message

I think we should change the meeting time
```

**Features**:
- Sender identity hidden
- Message attributed to "Anonymous"
- Can be disabled by owner

---

## 🔧 Owner Commands

### .ghost
**Access**: Owner only
**Usage**: `.ghost <on|off>`
**Description**: Toggle ghost mode (invisible operation)

**Examples**:
```
.ghost on   # Enable ghost mode
.ghost off  # Disable ghost mode
```

**When Enabled**:
- Bot doesn't respond to regular users
- Commands execute silently
- Only owner sees responses
- Perfect for covert moderation

---

## 📊 Admin API Commands

These commands are executed via API, not in WhatsApp chat.

### Generate License
```bash
POST /api/premium/generate
{
  "type": "monthly",
  "count": 5
}
```

### Get Analytics
```bash
GET /api/admin/analytics
```

### Update User Permissions
```bash
PATCH /api/admin/users/:phoneNumber
{
  "isAdmin": true
}
```

### Update Group Settings
```bash
PATCH /api/admin/groups/:groupId
{
  "settings": {
    "antiTag": {
      "enabled": true,
      "maxMentions": 3
    }
  }
}
```

---

## ⚙️ Command Behavior

### Rate Limiting
- Commands are rate-limited per user
- Default: 10 commands per minute
- Premium users: 30 commands per minute

### Permissions
```
Owner > Admin > User
```

**Permission Levels**:
- **Owner**: Full access to all commands
- **Admin**: Group management commands
- **User**: Basic commands only

### Error Handling
All commands return user-friendly error messages:
```
❌ You need admin permissions to use this command.
❌ Usage: .tagall [message]
❌ User not found
```

### Silent Mode
When ghost mode is enabled:
- Commands from non-owners are silently ignored
- No error messages shown
- Logs still recorded

---

## 🎨 Customization

Commands can be customized in the core server:

```javascript
// core/src/services/commandService.js

static async handlePing(context) {
  return { message: '🏓 Custom response!' };
}
```

---

## 🔮 Future Commands

Planned for future releases:
- `.poll <question>` - Create polls
- `.vote <option>` - Vote in polls
- `.schedule <time> <message>` - Schedule messages
- `.translate <lang> <text>` - Translate text
- `.ai <prompt>` - AI chat
- `.stats` - Detailed statistics
- `.export` - Export data
- `.backup` - Backup group data

---

## 💡 Tips

1. **Batch Operations**: Use `.tagall` for important announcements
2. **Auto-Moderation**: Enable `.antitag` to prevent spam
3. **Progressive Discipline**: Use `.warn` before `.kick`
4. **Ghost Mode**: Perfect for silent monitoring
5. **Premium Features**: Unlock with `.activate`

---

## 🆘 Help

For command help in WhatsApp:
```
.menu  # Full command list
```

For technical support:
- Check logs: `pm2 logs isa-client`
- Review docs: `docs/README.md`
- Open GitHub issue

---

**Last Updated**: November 10, 2025
**Version**: 1.0.0
