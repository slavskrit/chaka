import Queue from "bull";
import { logger } from "../../core_api/src/logger";
import { complete_queue, s2t_queue } from "../../shared/constants";
import type { AudioToProcess } from "../../shared/types";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const s2tQueue = new Queue(s2t_queue, redisUrl);
const completeQueue = new Queue(complete_queue, redisUrl);

async function convertAudioToText(item: AudioToProcess) {
  logger.info(`Converting audio to text for the message ${item.messageId}`);
  completeQueue.add({ ...item });
}

async function listenToQueue() {
  s2tQueue.process(async (job, done) => {
    const message = job.data as AudioToProcess;
    await convertAudioToText(message);

    done();
  });
}

async function main() {
  logger.info("Starting S2T processor");
  await listenToQueue();
}

main().catch((err) => console.error(err));
