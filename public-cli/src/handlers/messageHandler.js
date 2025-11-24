import axios from 'axios';

// 1. INLINED HELPER FUNCTIONS
const extractMessageContent = (msg) => {
  const m = msg.message;
  if (!m) return {};

  const type = Object.keys(m)[0];
  const content = m.conversation || m[type]?.caption || m[type]?.text || '';
  
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = msg.key.remoteJid.endsWith('@g.us');
  
  return {
    content,
    sender,
    isGroup,
    groupId: isGroup ? msg.key.remoteJid : null,
    groupName: null 
  };
};

const parseCommand = (text) => {
  const [cmd, ...args] = text.trim().split(' ');
  // ✅ FIX: Remove the dot prefix (e.g. ".ping" -> "ping")
  // The server expects the command name without the symbol
  const commandName = cmd.startsWith('.') ? cmd.slice(1) : cmd;
  return { command: commandName.toLowerCase(), args };
};

// 2. MAIN HANDLER
export const handleMessage = async (sock, message, config) => {
  try {
    const { content, sender, isGroup, groupId, groupName } = extractMessageContent(message);

    if (!content || content.trim().length === 0) return;
    if (!content.startsWith('.')) return; // Ignore non-commands

    const { command, args } = parseCommand(content);
    if (!command) return;

    // Log for debugging
    console.log(`\n📨 DETECTED COMMAND: ${command} (User: ${sender})`);
    
    const cleanPhone = sender.split('@')[0];

    // 3. SEND TO CORE SERVER
    let response;
    try {
        response = await axios.post(
          `${config.coreApiUrl}/api/commands/execute`,
          {
            command, // Now sending "ping" instead of ".ping"
            args,
            user: {
              phoneNumber: cleanPhone,
              name: message.pushName || 'Unknown'
            },
            group: isGroup ? { groupId, name: 'Group' } : null,
            participants: [],
            mentionedUsers: []
          },
          {
            headers: { 
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json'
            }
          }
        );
    } catch (apiError) {
        console.error(`❌ CORE SERVER ERROR:`);
        if (apiError.code === 'ECONNREFUSED') {
            console.error(`   Connection refused! Is the Core Server running on port 3000?`);
        } else {
            console.error(`   ${apiError.message}`);
        }
        await sock.sendMessage(message.key.remoteJid, { text: '❌ Bot Core Server is offline.' });
        return;
    }

    const { result, success, silent, message: errorMsg } = response.data;

    if (silent) {
        console.log('🤫 Core requested silence (likely Permission Denied)');
        return;
    }

    if (!success) {
        // If server says "Unknown command", it will show here
        console.log(`⚠️ Command failed: ${errorMsg}`);
        await sock.sendMessage(message.key.remoteJid, { text: `⚠️ ${errorMsg}` });
        return;
    }

    // 4. SEND REPLY TO WHATSAPP
    if (result && result.message) {
        console.log(`📤 Replying: "${result.message.substring(0, 20)}..."`);
        await sock.sendMessage(message.key.remoteJid, { text: result.message });
    }

  } catch (error) {
    console.error('❌ CRITICAL HANDLER ERROR:', error.message);
  }
};