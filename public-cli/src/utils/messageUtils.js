export const extractMessageContent = (message) => {
  const messageType = Object.keys(message.message || {})[0];
  let content = '';

  // Extract text from different message types
  if (messageType === 'conversation') {
    content = message.message.conversation;
  } else if (messageType === 'extendedTextMessage') {
    content = message.message.extendedTextMessage.text;
  } else if (messageType === 'imageMessage') {
    content = message.message.imageMessage.caption || '';
  } else if (messageType === 'videoMessage') {
    content = message.message.videoMessage.caption || '';
  }

  const sender = message.key.remoteJid?.endsWith('@g.us')
    ? message.key.participant
    : message.key.remoteJid;

  const isGroup = message.key.remoteJid?.endsWith('@g.us');
  const groupId = isGroup ? message.key.remoteJid : null;

  return {
    content: content.trim(),
    sender,
    isGroup,
    groupId,
    groupName: null, // Will be filled later
    messageType
  };
};

export const parseCommand = (content) => {
  if (!content.startsWith('.')) {
    return { command: null, args: [] };
  }

  const parts = content.slice(1).trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
};

export const formatPhoneNumber = (jid) => {
  return jid.split('@')[0];
};

export const extractMentions = (message) => {
  const contextInfo = message.message?.extendedTextMessage?.contextInfo;
  return contextInfo?.mentionedJid || [];
};

export const isOwner = (phoneNumber, ownerNumber) => {
  return phoneNumber === ownerNumber;
};
