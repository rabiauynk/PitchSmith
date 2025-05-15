
import { createLogger } from '@mastra/core/logger';
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';

import { pitchSmith } from './agents/pitchsmith';
import { startTelegramPolling } from './services/telegramPolling';

export const mastra = new Mastra({
  agents: { pitchSmith },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// Telegram polling servisini başlat
console.log('[MASTRA] Initializing Telegram bot...');
startTelegramPolling()
  .then(() => {
    console.log('[MASTRA] Telegram bot initialized successfully');
  })
  .catch((error) => {
    console.error('[MASTRA] Failed to initialize Telegram bot:', error);
  });
