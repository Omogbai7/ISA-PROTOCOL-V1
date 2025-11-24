import { v4 as uuidv4 } from 'uuid';

// Format phone number to international format
export const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Add country code if missing (assuming international format)
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }

  return cleaned;
};

// Check if message contains spam patterns
export const isSpam = (message) => {
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner)\b/i,
    /\b(click here|buy now|limited offer)\b/i,
    /(\$\$\$|💰💰💰)/,
    /(https?:\/\/[^\s]+){3,}/i // Multiple links
  ];

  return spamPatterns.some(pattern => pattern.test(message));
};

// Check if message contains links
export const containsLinks = (message) => {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  return urlPattern.test(message);
};

// Count mentions in a message
export const countMentions = (message) => {
  const mentionPattern = /@\d+/g;
  const mentions = message.match(mentionPattern);
  return mentions ? mentions.length : 0;
};

// Chunk array for batch processing
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Generate random ID
export const generateId = () => {
  return uuidv4();
};

// Sleep utility
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Rate limiter helper
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();

  return (key) => {
    const now = Date.now();
    const userRequests = requests.get(key) || [];

    // Filter out old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    validRequests.push(now);
    requests.set(key, validRequests);
    return true; // Request allowed
  };
};

// Format duration
export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Sanitize input
export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};
