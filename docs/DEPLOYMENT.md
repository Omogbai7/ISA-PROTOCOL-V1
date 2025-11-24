# Deployment Guide

## Prerequisites

- Node.js 18+ or Bun
- MongoDB instance (local or cloud)
- VPS or Termux environment
- Domain (optional, for production)

---

## Option 1: VPS Deployment (Recommended for Production)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (or Bun)
curl -fsSL https://bun.sh/install | bash

# Install MongoDB
sudo apt install mongodb -y
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Install PM2 for process management
npm install -g pm2
```

### 2. Clone Repository

```bash
cd /opt
git clone <your-repo-url> isa-protocol-v1
cd isa-protocol-v1
```

### 3. Setup Core Server

```bash
cd core
bun install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/isa-protocol
JWT_SECRET=$(openssl rand -hex 32)
API_KEY=$(openssl rand -hex 32)
OWNER_PHONE=1234567890
EOF

# Start with PM2
pm2 start src/index.js --name isa-core
pm2 save
pm2 startup
```

### 4. Setup Public CLI

```bash
cd ../public-cli
bun install

# Create .env file
cat > .env << EOF
CORE_API_URL=http://localhost:3000
API_KEY=<same-api-key-from-core>
OWNER_PHONE=1234567890
DEBUG=false
EOF

# Start with PM2
pm2 start src/index.js --name isa-client
pm2 save
```

### 5. Configure Nginx (Optional)

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/isa-protocol
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/isa-protocol /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL (Optional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Option 2: Termux Deployment (Mobile)

### 1. Install Termux

Download from F-Droid: https://f-droid.org/en/packages/com.termux/

### 2. Setup Termux

```bash
# Update packages
pkg update && pkg upgrade -y

# Install required packages
pkg install nodejs git -y

# Grant storage permission
termux-setup-storage
```

### 3. Install MongoDB (Alternative: Use MongoDB Atlas)

```bash
# For Termux, we recommend using MongoDB Atlas (cloud)
# Get free cluster at: https://www.mongodb.com/cloud/atlas

# Or install local MongoDB
pkg install mongodb -y
```

### 4. Clone and Setup

```bash
cd ~
git clone <your-repo-url> isa-protocol-v1
cd isa-protocol-v1
```

### 5. Setup Core Server

```bash
cd core
npm install

# Create .env
nano .env
```

Paste:
```env
PORT=3000
MONGO_URI=<your-mongodb-atlas-uri-or-local>
JWT_SECRET=your-secret-key
API_KEY=your-api-key
OWNER_PHONE=1234567890
```

```bash
# Start server
npm start
```

### 6. Setup Public CLI (New Terminal)

Open new Termux session:

```bash
cd ~/isa-protocol-v1/public-cli
npm install

# Create .env
nano .env
```

Paste:
```env
CORE_API_URL=http://localhost:3000
API_KEY=same-as-core
OWNER_PHONE=1234567890
```

```bash
# Start client
npm start
```

### 7. Keep Running (Termux)

Install `termux-services`:

```bash
pkg install termux-services -y

# Create service for core
mkdir -p ~/.termux/boot
nano ~/.termux/boot/isa-core.sh
```

Paste:
```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/isa-protocol-v1/core
npm start > ~/isa-core.log 2>&1 &
```

```bash
chmod +x ~/.termux/boot/isa-core.sh
```

---

## Option 3: Docker Deployment

### 1. Create Dockerfile (Core)

```dockerfile
# isa-protocol-v1/core/Dockerfile
FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "start"]
```

### 2. Create Dockerfile (Public CLI)

```dockerfile
# isa-protocol-v1/public-cli/Dockerfile
FROM oven/bun:latest

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

CMD ["bun", "start"]
```

### 3. Create Docker Compose

```yaml
# isa-protocol-v1/docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  core:
    build: ./core
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/isa-protocol
      - JWT_SECRET=your-secret-key
      - API_KEY=your-api-key
    depends_on:
      - mongodb

  client:
    build: ./public-cli
    environment:
      - CORE_API_URL=http://core:3000
      - API_KEY=your-api-key
      - OWNER_PHONE=1234567890
    depends_on:
      - core
    volumes:
      - ./public-cli/auth_info:/app/auth_info

volumes:
  mongodb_data:
```

### 4. Run Docker

```bash
docker-compose up -d
```

---

## Post-Deployment

### 1. Verify Installation

```bash
# Check core server
curl http://localhost:3000/health

# Check PM2 status
pm2 status

# View logs
pm2 logs isa-core
pm2 logs isa-client
```

### 2. Scan QR Code

Check public-cli logs for WhatsApp QR code:

```bash
pm2 logs isa-client
```

Scan with WhatsApp mobile app: **Settings → Linked Devices → Link a Device**

### 3. Test Bot

Send a message to the bot:
```
.ping
```

### 4. Generate Premium Licenses

```bash
curl -X POST http://localhost:3000/api/premium/generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"type": "trial", "count": 5}'
```

---

## Monitoring

### PM2 Monitoring

```bash
# Monitor in real-time
pm2 monit

# View logs
pm2 logs

# Restart services
pm2 restart all
```

### Database Backup

```bash
# Backup MongoDB
mongodump --db isa-protocol --out /backup/$(date +%Y%m%d)

# Restore
mongorestore --db isa-protocol /backup/20251110
```

---

## Troubleshooting

### Core Server Won't Start

```bash
# Check MongoDB connection
sudo systemctl status mongodb

# Check logs
pm2 logs isa-core

# Restart
pm2 restart isa-core
```

### Public CLI Connection Issues

```bash
# Delete auth session and reconnect
rm -rf public-cli/auth_info
pm2 restart isa-client

# Scan new QR code
pm2 logs isa-client
```

### Database Issues

```bash
# Restart MongoDB
sudo systemctl restart mongodb

# Check database
mongo
> use isa-protocol
> db.users.find()
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Change default API_KEY
- [ ] Enable firewall (ufw)
- [ ] Setup SSL/HTTPS
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update dependencies regularly
- [ ] Restrict MongoDB access
- [ ] Use strong passwords
- [ ] Enable rate limiting

---

## Updates

```bash
cd /opt/isa-protocol-v1
git pull origin main
cd core && bun install
cd ../public-cli && bun install
pm2 restart all
```

---

## Support

For issues:
1. Check logs: `pm2 logs`
2. Review configuration
3. Consult documentation
4. Open GitHub issue
