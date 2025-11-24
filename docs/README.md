# Isa Protocol V1 - WhatsApp Bot

A powerful, modular WhatsApp automation and management bot with premium features, group moderation, and silent operations.

## 🌟 Features

### Group Management & Moderation
- **Smart Tag-All**: Tag all members in chunks to avoid spam detection
- **Anti-Tag Protection**: Auto-delete mass mentions with configurable thresholds
- **Auto-Warnings & Kicks**: Progressive warning system (warn → kick → ban)
- **Message Auto-Deletion**: Remove spam, links, and offensive content
- **Silent Mode**: Bot operates invisibly for non-owners

### User Engagement
- **Games & Trivia**: Interactive group activities
- **Anonymous Messages**: Private posting within groups
- **Web Search**: Direct search results in WhatsApp
- **Custom Reactions**: Engaging bot responses

### Premium System
- **License-based Activation**: Secure code-based premium unlocking
- **Multiple Plans**: Trial, Monthly, Yearly, Lifetime
- **Device Pairing**: Phone number + OTP or QR code fallback
- **Premium Features**: Scheduled messages, AI responses, analytics

### Owner/Admin Tools
- **Animated Menu**: Loading animations for owner menu
- **Command Logging**: Track usage and analytics
- **Invisible Status**: Owner-only logs and reports
- **Modular Commands**: Comprehensive admin toolkit

## 🏗️ Architecture

```
isa-protocol-v1/
├── core/              # Private server (business logic)
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── models/    # Database models
│   │   └── utils/     # Utilities
│   └── package.json
│
├── public-cli/        # Public client (WhatsApp connection)
│   ├── src/
│   │   ├── handlers/  # Message handlers
│   │   ├── utils/     # Utilities
│   │   └── config/    # Configuration
│   └── package.json
│
└── docs/              # Documentation
```

## 📦 Installation

### Prerequisites
- Node.js 18+ (Bun recommended)
- MongoDB
- VPS or Termux (for deployment)

### Core Server Setup

```bash
cd core
bun install
cp .env.example .env
# Edit .env with your configuration
bun start
```

### Public CLI Setup

```bash
cd public-cli
bun install
cp .env.example .env
# Edit .env with core server URL and API key
bun start
```

## 🔧 Configuration

### Core Server (.env)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/isa-protocol
JWT_SECRET=your-secret-key
API_KEY=your-api-key
OWNER_PHONE=1234567890
```

### Public CLI (.env)
```env
CORE_API_URL=http://your-server:3000
API_KEY=same-as-core-server
OWNER_PHONE=1234567890
```

## 📱 Commands

### Group Management
- `.menu` - Show full menu (owner only)
- `.ping` - Check bot status
- `.tagall <message>` - Tag all members
- `.antitag on/off` - Toggle anti-tag protection
- `.warn @user` - Issue warning
- `.kick @user` - Remove user
- `.ban @user` - Permanently ban user
- `.unban @user` - Remove ban

### Premium
- `.upgrade` - View premium plans
- `.activate <code>` - Activate premium license
- `.status` - View your status and stats

### Engagement
- `.search <query>` - Web search
- `.anonymous <message>` - Post anonymously
- `.ghost on/off` - Toggle ghost mode

## 🚀 Deployment

### VPS Deployment

```bash
# Install dependencies
bun install

# Start core server with PM2
pm2 start core/src/index.js --name isa-core

# Start public CLI
pm2 start public-cli/src/index.js --name isa-client
```

### Termux Deployment

```bash
# Install Termux packages
pkg install nodejs git

# Clone and setup
git clone <your-repo>
cd isa-protocol-v1/public-cli
npm install
npm start
```

## 🔐 Security

- **API Key Authentication**: Secure communication between CLI and Core
- **JWT Tokens**: Session management
- **Rate Limiting**: Prevent abuse
- **Input Sanitization**: Protect against injection attacks
- **Encrypted Communication**: HTTPS required for production

## 📊 Analytics

Access analytics via Core API:

```bash
GET /api/admin/analytics
Headers: x-api-key: your-api-key
```

Returns:
- Total users (premium/free)
- Total groups
- Command statistics
- Top users and commands

## 🎯 Premium License Generation

Generate licenses via API:

```bash
POST /api/premium/generate
Headers: x-api-key: your-api-key
Body: {
  "type": "monthly",
  "count": 1
}
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues and feature requests, please open an issue in the repository.

## 🔄 Updates

Stay updated with the latest features and security patches by regularly pulling from the main branch.

---

**Powered by Isa Protocol V1**
