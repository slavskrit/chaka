import Queue from "bull";
import TelegramBot, { type SendPhotoOptions } from "node-telegram-bot-api";
import {
  s2t_queue,
  s2t_queue_complete,
  sd_queue,
  sd_queue_complete,
} from "../shared/constants";
import type { AudioToProcess, TextToImageProcess } from "../shared/types";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const s2tQueue = new Queue(s2t_queue, redisUrl);
const s2tQueueComplete = new Queue(s2t_queue_complete, redisUrl);
const sdQueue = new Queue(sd_queue, redisUrl);
const sdQueueComplete = new Queue(sd_queue_complete, redisUrl);

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
      const audioToProcess = job.data as AudioToProcess;
      logger.info(
        `Replying to the message in chat ${audioToProcess.chatId} with parsed text`
      );

      const text = audioToProcess.text ?? "😬";
      const message = await this.bot.sendMessage(audioToProcess.chatId, text, {
        reply_to_message_id: audioToProcess.messageId,
      });

      this.bot.setMessageReaction(message.chat.id, message.message_id, {
        reaction: [{ type: "emoji", emoji: "✍" }],
      });

      sdQueue.add({
        chatId: audioToProcess.chatId,
        messageId: message.message_id,
        queryText: text,
      } as TextToImageProcess);
      done();
    });

    sdQueueComplete.process(async (job, done) => {
      const textToImageProcess = job.data as TextToImageProcess;
      logger.info(`SD complete for the ${textToImageProcess.messageId}`);

      const photo = "/Users/dp/Downloads/photo.jpg";
      const photoOptions: SendPhotoOptions = {
        caption: textToImageProcess.queryText,
      };

      const updatedMessage = await this.bot.sendPhoto(
        textToImageProcess.chatId,
        photo,
        photoOptions
      );
      this.bot.deleteMessage(
        textToImageProcess.chatId,
        textToImageProcess.messageId
      );
      this.bot.setMessageReaction(
        updatedMessage.chat.id,
        updatedMessage.message_id,
        {
          reaction: [{ type: "emoji", emoji: "🎉" }],
        }
      );
      done();
    });
  }
}

export { Api };
