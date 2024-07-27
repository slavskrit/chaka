import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);

async function listenToQueue(key: string) {
  while (true) {
    const item = await redis.blpop(key, 0);
    if (item) {
      console.log(`Processing item: ${item[1]}`);
      // Process the item
    }
  }
}

async function main() {
  await listenToQueue("my_queue");
}

main().catch((err) => console.error(err));
