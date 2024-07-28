import Queue from "bull";
import { sd_queue, sd_queue_complete } from "../shared/constants";
import type { TextToImageProcess } from "../shared/types";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const sdQueue = new Queue(sd_queue, redisUrl);
const sdQueueComplete = new Queue(sd_queue_complete, redisUrl);

async function generateImageFromText(item: TextToImageProcess) {
  logger.info(`Generating image from text the message ${item.messageId}`);
  const imagePath = "";
  const obj = { ...item, imagePath } as TextToImageProcess;
  sdQueueComplete.add(obj);
}

async function listenToQueue() {
  sdQueue.process(async (job, done) => {
    const message = job.data as TextToImageProcess;
    await generateImageFromText(message);

    done();
  });
}

async function main() {
  logger.info("Starting SD processor");
  listenToQueue();
}

main().catch((err) => console.error(err));
