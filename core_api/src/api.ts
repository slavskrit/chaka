import Queue from "bull";
import TelegramBot from "node-telegram-bot-api";
import { s2t_queue, s2t_queue_complete } from "../../shared/constants";
import { AudioToProcess } from "../../shared/types";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const s2tQueue = new Queue(s2t_queue, redisUrl);
const s2tQueueComplete = new Queue(s2t_queue_complete, redisUrl);

logger.info("Api is started");
logger.info(`Listening REDIS at the address: ${redisUrl}`);

class Api {
  bot: TelegramBot;

  constructor(bot: TelegramBot) {
    this.bot = bot;
    this.listenCompleteQueues();
  }

  async inqueueAudioToProcessing(
    path: string,
    chatId: number,
    messageId: number = 0,
    duration: number = 0
  ) {
    if (!path) {
      logger.warn(`Path is wrong: ${path}`);
      return;
    }
    await s2tQueue.add({
      path,
      chatId,
      messageId,
      duration,
    } as AudioToProcess);
  }

  async createRecord() {}
  async updateRecord() {}
  async deleteRecord() {}
  async reprocessRecord() {}

  async listenCompleteQueues() {
    s2tQueueComplete.process(async (job, done) => {
      logger.info("poop");

      const audioToProcess = job.data as AudioToProcess;
      logger.info(
        `Replying to the message in chat ${audioToProcess.chatId} with parsed text`
      );

      this.bot.sendMessage(audioToProcess.chatId, audioToProcess.text ?? "😬", {
        reply_to_message_id: audioToProcess.messageId,
      });
      done();
    });
  }
}

export { Api };
