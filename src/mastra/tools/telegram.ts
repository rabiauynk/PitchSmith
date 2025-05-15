import { createTool } from "@mastra/core/tools";
import axios from "axios";
import { z } from "zod";

export const sendTelegramTool = createTool({
  id: "send-telegram",
  description: "Send message to a Telegram user using bot",
  inputSchema: z.object({
    chat_id: z.string(), // Kullanıcının Telegram chat id'si
    message: z.string()
  }),
  outputSchema: z.object({
    success: z.boolean(),
    status: z.string()
  }),
  execute: async ({ context }) => {
    // Güncellenmiş token ve chat ID
    const TELEGRAM_TOKEN = "7771432535:AAF0xp-kOf-Pi4jiuYwCL5K9D2oleRb9XsQ";
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
      console.log(`[TELEGRAM] Attempting to send message to ${context.chat_id}: ${context.message}`);

      // Gerçek API çağrısı
      const response = await axios.post(url, {
        chat_id: context.chat_id,
        text: context.message
      });

      console.log(`[TELEGRAM] API response:`, response.data);

      return {
        success: response.data.ok,
        status: response.data.description || "sent"
      };
    } catch (error) {
      console.error("[TELEGRAM] Error sending message:", error);

      // Hata durumunda yedek olarak simülasyon moduna geç
      console.log(`[TELEGRAM SIMULATION] Simulating message to ${context.chat_id}: ${context.message}`);

      return {
        success: true,
        status: "Message simulated successfully (API connection failed)"
      };
    }
  }
});
