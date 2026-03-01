import TelegramBot from "node-telegram-bot-api";

/**
 * Lazily initialised Telegram bot instance.
 * We only create the bot if both env vars are present so the
 * rest of the app works even without Telegram configured.
 */
let bot = null;

function getBot() {
    if (bot) return bot;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;

    try {
        // polling: false  →  we only SEND messages, we never receive update events
        bot = new TelegramBot(token, { polling: false });
        return bot;
    } catch (err) {
        console.error("[Telegram] Failed to init bot:", err.message);
        return null;
    }
}

/**
 * Send a plain-text notification to the configured Telegram chat.
 *
 * @param {string} text   – The message text (Markdown supported)
 * @returns {Promise<void>}
 */
export async function sendTelegramNotification(text) {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) return; // silently skip if not configured

    const instance = getBot();
    if (!instance) return;

    try {
        await instance.sendMessage(chatId, text, { parse_mode: "Markdown" });
    } catch (err) {
        // Never crash the main app because of a Telegram error
        console.error("[Telegram] Failed to send message:", err.message);
    }
}
