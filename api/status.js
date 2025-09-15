import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  password: process.env.REDIS_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export default async function handler(req, res) {
  try {
    const executes = await redis.get("executes") || 0;
    const online = await redis.smembers("online_users");

    res.status(200).json({ executes: Number(executes), online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
