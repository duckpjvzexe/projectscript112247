import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  password: process.env.REDIS_TOKEN,
  tls: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    await redis.set("executes", 0);
    await redis.del("online_users");

    res.status(200).json({ message: "Reset done" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
