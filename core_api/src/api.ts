import Queue from "bull";
import { complete_queue, s2t_queue } from "../../shared/constants";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const s2tQueue = new Queue(s2t_queue, redisUrl);
const completeQueue = new Queue(complete_queue, redisUrl);

logger.info("Api is started");
logger.info(`Listening REDIS by the adress: ${redisUrl}`);

async function inqueueAudioToProcessing(
  path: string,
  messageId: number = 0,
  duration: number = 0
) {
  if (!path) {
    logger.warn(`Path is wrong: ${path}`);
  }
  s2tQueue.add({
    path: path,
    messageId: messageId,
    duration: duration,
  });
}
async function createRecord() {}
async function updateRecord() {}
async function deleteRecord() {}
async function reprocessRecord() {}

async function listenCompleteQueue() {
  completeQueue.process((job, done) => {
    // TODO: add to db.
    logger.info(`Job is completed ${job.id}`);
    done();
  });
}

async function main() {
  listenCompleteQueue();
}

main().catch((err) => console.error(err));

export { inqueueAudioToProcessing };
