import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);

async function pushToQueue(key: string, value: string) {
  await redis.lpush(key, value);
  console.log(`Pushed ${value} to ${key}`);
}

async function main() {
  let counter = 0;
  setInterval(async () => {
    counter++;
    await pushToQueue("my_queue", `item${counter}`);
  }, 1000);
}

main().catch((err) => console.error(err));
