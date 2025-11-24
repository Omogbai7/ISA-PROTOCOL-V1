# Isa Protocol V1

> **Professional WhatsApp Bot with Premium Features, Group Management & Silent Operations**

A powerful, modular WhatsApp automation bot combining the best features of existing bots with enhanced premium modules, automation, and advanced group management.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/bun-latest-orange)](https://bun.sh/)

---

## ✨ Features

### 🛡️ Group Management
- **Smart Tag-All** - Mention all members without spam detection
- **Anti-Tag Protection** - Auto-delete mass mentions
- **Auto-Moderation** - Progressive warning system (warn → kick → ban)
- **Auto-Delete** - Remove spam, links, offensive content
- **Silent Mode** - Invisible operation for non-owners

### 💎 Premium System
- **License-Based Activation** - Secure code activation
- **Multiple Plans** - Trial, Monthly, Yearly, Lifetime
- **Device Pairing** - Phone + OTP or QR fallback
- **Premium Features** - Scheduled messages, AI responses, analytics

### 🎮 User Engagement
- **Games & Trivia** - Interactive group activities
- **Anonymous Messages** - Private posting
- **Web Search** - Direct search results in chat
- **Custom Reactions** - Engaging responses

### 🔧 Admin Tools
- **Animated Menu** - Loading animations for owner
- **Command Logging** - Usage analytics
- **Invisible Logs** - Owner-only reports
- **Modular Commands** - Comprehensive toolkit

---

## 🏗️ Architecture

```
┌─────────────────┐          ┌─────────────────┐
│   Public CLI    │◄────────►│   Core Server   │
│  (WhatsApp)     │   API    │ (Business Logic)│
└─────────────────┘          └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
  ┌──────────┐              ┌──────────────┐
  │ WhatsApp │              │   MongoDB    │
  │  Cloud   │              │   Database   │
  └──────────┘              └──────────────┘
```

**Separation of Concerns:**
- **Public CLI**: Minimal WhatsApp connection script (deployed by users)
- **Core Server**: Contains all business logic, premium validation, sensitive operations
- **Database**: Stores users, groups, licenses, analytics

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- MongoDB (local or Atlas)
- VPS or Termux environment

### Automated Setup

```bash
# Clone repository
git clone <your-repo-url>
cd isa-protocol-v1

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

**1. Core Server**
```bash
cd core
bun install
cp .env.example .env
# Edit .env with your configuration
bun start
```

**2. Public CLI**
```bash
cd public-cli
bun install
cp .env.example .env
# Edit .env with Core API URL and API key
bun start
```

**3. Scan QR Code**
Scan the QR code with WhatsApp mobile app.

**4. Test Bot**
Send `.ping` to the bot.

---

## 📱 Commands

| Command | Access | Description |
|---------|--------|-------------|
| `.menu` | Owner | Show full animated menu |
| `.ping` | Public | Check bot status |
| `.tagall <msg>` | Admin | Tag all members |
| `.antitag on/off` | Admin | Toggle anti-tag |
| `.warn @user` | Admin | Issue warning |
| `.kick @user` | Admin | Remove user |
| `.ban @user` | Owner | Permanently ban |
| `.search <query>` | Public | Web search |
| `.anonymous <msg>` | Public | Anonymous post |
| `.upgrade` | Public | Premium info |
| `.activate <code>` | Public | Activate premium |
| `.status` | Public | View your status |
| `.ghost on/off` | Owner | Toggle ghost mode |

---

## 📚 Documentation

- **[Main Documentation](docs/README.md)** - Complete guide
- **[API Reference](docs/API.md)** - API endpoints
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment

---

## 🔐 Security Features

- ✅ API Key Authentication
- ✅ JWT Token Management
- ✅ Rate Limiting
- ✅ Input Sanitization
- ✅ Encrypted Communication
- ✅ Role-Based Access Control

---

## 📊 Premium Plans

| Plan | Duration | Price | Features |
|------|----------|-------|----------|
| **Trial** | 7 days | Free | All features |
| **Monthly** | 30 days | $9.99 | All features |
| **Yearly** | 365 days | $99.99 | All features + discount |
| **Lifetime** | Forever | $299.99 | All features forever |

Generate licenses via API:
```bash
POST /api/premium/generate
{
  "type": "monthly",
  "count": 1
}
```

---

## 🌐 Deployment Options

### Option 1: VPS (Production)
```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start core/src/index.js --name isa-core
pm2 start public-cli/src/index.js --name isa-client
pm2 save
```

### Option 2: Termux (Mobile)
```bash
pkg install nodejs git
cd ~
git clone <repo>
cd isa-protocol-v1
# Follow setup steps
```

### Option 3: Docker
```bash
docker-compose up -d
```

---

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
CORE_API_URL=http://localhost:3000
API_KEY=your-api-key
OWNER_PHONE=1234567890
```

---

## 📈 Analytics

View real-time analytics:
```bash
GET /api/admin/analytics
```

Returns:
- Total users (premium/free)
- Command statistics
- Top users and commands
- Group activity

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [docs/README.md](docs/README.md)
- **Issues**: Open a GitHub issue
- **Discussions**: GitHub Discussions

---

## 🎯 Roadmap

- [x] Core bot functionality
- [x] Premium system
- [x] Group management
- [x] Auto-moderation
- [ ] AI integration
- [ ] Web dashboard
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Advanced analytics

---

## ⚠️ Disclaimer

This bot is for educational and legitimate business purposes only. Users are responsible for complying with WhatsApp's Terms of Service and local laws.

---

## 🌟 Star History

If you find this project useful, please give it a ⭐️!

---

**Built with ❤️ by io.dev**
