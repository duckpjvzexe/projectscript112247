import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  password: process.env.REDIS_TOKEN,
  tls: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, userid } = req.body;

    await redis.incr("executes");

    if (username && userid) {
      await redis.sadd("online_users", `${username} (${userid})`);
    }

    const executes = await redis.get("executes");
    const online = await redis.smembers("online_users");

    res.status(200).json({ executes: Number(executes), online });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
