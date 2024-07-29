import Queue from "bull";
import { sd_queue, sd_queue_complete } from "../shared/constants";
import type { TextToImageProcess } from "../shared/types";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const sdQueue = new Queue(sd_queue, redisUrl);
const sdQueueComplete = new Queue(sd_queue_complete, redisUrl);

import { Buffer } from "buffer";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";

async function generateImageFromText(item: TextToImageProcess) {
  logger.info(`Generating image from text the message ${item.messageId}`);
  const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
    body: `{"prompt": "${item.queryText}","steps": 50,"cfg_scale": 7,"sampler_index": "Euler a","width": 512,"height": 512}`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const base64image = (await response.json()).images[0];

  logger.info(`Response from SD API is awaited`);
  const buffer = Buffer.from(base64image, "base64");
  const tempDir = os.tmpdir();
  logger.info(`Temp file is created for the generated image ${tempDir}`);
  const tempFile = path.join(tempDir, "output.png");

  writeFileSync(tempFile, buffer);
  const obj = { ...item, imagePath: tempFile } as TextToImageProcess;

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
