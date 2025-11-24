import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import dotenv from 'dotenv';
import { handleMessage } from './handlers/messageHandler.js';

dotenv.config();

// Simple logger to keep terminal clean
const logger = pino({ level: 'silent' });

const connectToWhatsApp = async () => {
  // Ensure we have the phone number for pairing
  const phoneNumber = process.env.OWNER_PHONE 
    ? process.env.OWNER_PHONE.replace(/[^0-9]/g, '') 
    : undefined;

  if (!phoneNumber) {
    console.error('❌ FATAL ERROR: OWNER_PHONE is missing in your .env file');
    console.error('Please add: OWNER_PHONE=234xxxxxxxxxx');
    process.exit(1);
  }

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_public');
  const { version } = await fetchLatestBaileysVersion();

  console.log(`
╔══════════════════════════════════════╗
║   ISA PROTOCOL V1 - PUBLIC CLIENT    ║
╚══════════════════════════════════════╝
📱 Using WA v${version.join('.')}`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false, // Using Pairing Code
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"], // Disguise as Chrome on Ubuntu
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    // Increase timeout values to prevent instability
    connectTimeoutMs: 60000, 
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    retryRequestDelayMs: 250
  });

  // ---------------------------------------------------------
  // PAIRING CODE LOGIC
  // ---------------------------------------------------------
  if (!sock.authState.creds.registered) {
    console.log('⏳ Waiting for connection to initialize...');
    await delay(2000);
    
    try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n╔══════════════════════════════════════╗`);
        console.log(`║  YOUR PAIRING CODE:  ${code}  ║`);
        console.log(`╚══════════════════════════════════════╝\n`);
        console.log(`👉 Open WhatsApp > Settings > Linked Devices > Link with phone number`);
    } catch (err) {
        console.error('❌ Failed to request pairing code:', err.message);
    }
  }

  // Connection Updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true;

      console.log('❌ Connection closed. Reconnecting:', shouldReconnect);

      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        console.log('❌ Logged out. Delete "auth_info_public" folder to re-pair.');
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp successfully!');
    }
  });

  // Save credentials whenever they update
  sock.ev.on('creds.update', saveCreds);

  // Message Handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      if (message.key.fromMe) continue;

      try {
        // Configuration object passed to handler
        const config = {
            coreApiUrl: 'http://localhost:3000',
            apiKey: process.env.API_KEY
        };
        await handleMessage(sock, message, config);
      } catch (error) {
        console.error('Error handling message:', error.message);
      }
    }
  });

  return sock;
};

// Start the bot
connectToWhatsApp().catch(err => {
  console.error('Failed to connect:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
});