import { getMe, getUpdates, handleTelegramMessage } from './telegramService';

let isPolling = false;
let lastUpdateId = 0;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;
const CONNECTION_RETRY_DELAY = 5000; // 5 seconds

// Telegram long polling başlatma
export async function startTelegramPolling(): Promise<void> {
  if (isPolling) {
    console.log('[TELEGRAM] Polling already started');
    return;
  }

  isPolling = true;
  connectionAttempts = 0;

  try {
    // Bot bilgilerini kontrol et
    console.log('[TELEGRAM] Connecting to Telegram API...');
    const botInfo = await getMe();
    console.log(`[TELEGRAM] Bot connected: ${botInfo.result.first_name} (@${botInfo.result.username})`);

    // Long polling döngüsünü başlat
    pollTelegram();
  } catch (error) {
    console.error('[TELEGRAM] Failed to start polling:', error);

    // Retry connection with exponential backoff
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      connectionAttempts++;
      const delay = CONNECTION_RETRY_DELAY * Math.pow(2, connectionAttempts - 1);
      console.log(`[TELEGRAM] Retrying connection in ${delay}ms (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);

      setTimeout(() => {
        startTelegramPolling();
      }, delay);
    } else {
      console.error(`[TELEGRAM] Failed to connect after ${MAX_CONNECTION_ATTEMPTS} attempts. Starting in offline mode.`);
      isPolling = true;
      pollTelegram();
    }
  }
}

// Telegram long polling durdurma
export function stopTelegramPolling(): void {
  isPolling = false;
  console.log('[TELEGRAM] Polling stopped');
}

// Long polling döngüsü
async function pollTelegram(): Promise<void> {
  console.log('[TELEGRAM] Starting polling loop');

  // İlk başlangıçta bir test mesajı gönderelim
  try {
    await handleTelegramMessage({
      chat: { id: "7730034235" },
      text: "PitchSmith bot başlatıldı! Şimdi benimle konuşabilirsiniz."
    });
  } catch (error) {
    console.error('[TELEGRAM] Error sending initial message:', error);
  }

  while (isPolling) {
    try {
      // Güncellemeleri al
      console.log('[TELEGRAM] Polling for updates...');
      const updates = await getUpdates(lastUpdateId + 1, 30);

      if (updates && updates.result && updates.result.length > 0) {
        console.log(`[TELEGRAM] Received ${updates.result.length} updates`);

        // Her güncellemeyi işle
        for (const update of updates.result) {
          if (update.update_id >= lastUpdateId) {
            lastUpdateId = update.update_id;
          }

          // Mesaj varsa işle
          if (update.message) {
            console.log(`[TELEGRAM] Processing message: ${update.message.text}`);
            await handleTelegramMessage(update.message);
          }
        }
      } else {
        console.log('[TELEGRAM] No new updates');
      }
    } catch (error) {
      console.error('[TELEGRAM] Polling error:', error);
      // Hata durumunda kısa bir süre bekle
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Her döngü arasında kısa bir süre bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
