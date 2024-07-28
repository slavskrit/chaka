import type { Message } from "node-telegram-bot-api";
import TelegramBot from "node-telegram-bot-api";
import { createTempDirectory } from "../shared/utils";
import { Api } from "./api";
import { logger } from "./logger";

const token =
  process.env.TELEGRAM_TOKEN || quit("No TELEGRAM_TOKEN found in env");
const bot = new TelegramBot(token!, { polling: true });
const api = new Api(bot);

logger.info("Telegram bot is started");

async function handleVoiceMessage(msg: Message) {
  logger.info(`Recieved audio file with duration: ${msg.voice?.duration}`);
  const chatId = msg.chat.id;
  const Reactions = [{ type: "emoji", emoji: "👀" }];
  // React first.
  bot.setMessageReaction(chatId, msg.message_id, {
    reaction: Reactions,
    is_big: true,
  });
  if (msg.voice) {
    const tempDir = createTempDirectory(chatId.toString());
    const pathToAudioFile = await bot.downloadFile(msg.voice.file_id, tempDir);
    logger.info(`Audio is downloaded into path: ${pathToAudioFile}`);
    api.inqueueAudioToProcessing(
      pathToAudioFile,
      chatId,
      msg.message_id,
      msg.voice?.duration
    );
  }
}

bot.on("message", (msg: Message) => {
  if (msg.voice) {
    handleVoiceMessage(msg);
  }
});

function quit(reason: string): void {
  logger.error(`Quitting because of ${reason}`);
  process.exit(1);
}
