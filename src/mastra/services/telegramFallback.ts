import { pitchSmith } from '../agents/pitchsmith';

// Simulated user sessions
interface UserSession {
  messages: { role: 'user' | 'assistant', content: string }[];
  lastActivity: number;
}

const userSessions: Record<string, UserSession> = {};
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Fallback function to handle Telegram messages when API is unavailable
export async function handleTelegramMessageFallback(chatId: string, text: string): Promise<string> {
  console.log(`[TELEGRAM FALLBACK] Processing message from ${chatId}: ${text}`);
  
  // Initialize or update user session
  if (!userSessions[chatId]) {
    userSessions[chatId] = {
      messages: [],
      lastActivity: Date.now()
    };
  }
  
  // Add user message to session
  userSessions[chatId].messages.push({ role: 'user', content: text });
  userSessions[chatId].lastActivity = Date.now();
  
  try {
    // Process message with PitchSmith agent
    console.log(`[TELEGRAM FALLBACK] Sending message to PitchSmith agent: ${text}`);
    const response = await pitchSmith.generate(userSessions[chatId].messages);
    console.log(`[TELEGRAM FALLBACK] Received response from PitchSmith agent: ${response.text}`);
    
    // Add agent response to session
    userSessions[chatId].messages.push({ role: 'assistant', content: response.text });
    
    // Clean up old sessions
    cleanupSessions();
    
    return response.text;
  } catch (error) {
    console.error('[TELEGRAM FALLBACK] Error processing message:', error);
    return 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

// Clean up old sessions
function cleanupSessions(): void {
  const now = Date.now();
  Object.keys(userSessions).forEach(chatId => {
    if (now - userSessions[chatId].lastActivity > SESSION_TIMEOUT) {
      console.log(`[TELEGRAM FALLBACK] Cleaning up session for ${chatId}`);
      delete userSessions[chatId];
    }
  });
}
