import Queue from "bull";
import { nodewhisper } from "nodejs-whisper";
import { s2t_queue, s2t_queue_complete } from "../shared/constants";
import type { AudioToProcess } from "../shared/types";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const s2tQueue = new Queue(s2t_queue, redisUrl);
const s2tQueueComplete = new Queue(s2t_queue_complete, redisUrl);

async function convertAudioToText(item: AudioToProcess) {
  logger.info(`Converting audio to text for the message ${item.messageId}`);
  const result = await nodewhisper("/Users/dp/Downloads/sample.ogg", {
    modelName: "base.en",
    autoDownloadModelName: "base.en",
  });
  const text = parseText(result);
  const obj = { ...item, text } as AudioToProcess;
  s2tQueueComplete.add(obj);
}

function parseText(input: string): string {
  return input
    .split("\n") // Split input by new lines
    .map((line) => line.replace(/\[.*?\]/g, "").trim()) // Remove timestamps and trim whitespace
    .filter((line) => line.length > 0) // Filter out empty lines
    .join(" "); // Join lines into a single string
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
  listenToQueue();
}

main().catch((err) => console.error(err));
