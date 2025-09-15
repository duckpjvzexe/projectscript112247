import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  password: process.env.REDIS_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export default async function handler(req, res) {
  const action = req.query.action; // ?action=execute | status | reset

  try {
    let body = {};
    if (req.method === "POST") {
      try {
        body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      } catch (e) {
        body = {};
      }
    }

    // 📌 EXECUTE
    if (action === "execute" && req.method === "POST") {
      const { username, userid } = body;

      await redis.incr("executes");

      if (username && userid) {
        await redis.sadd("online_users", `${username} (${userid})`);
      }

      const executes = await redis.get("executes");
      const online = await redis.smembers("online_users");

      return res.status(200).json({ executes: Number(executes), online });
    }

    // 📌 STATUS
    if (action === "status" && req.method === "GET") {
      const executes = await redis.get("executes") || 0;
      const online = await redis.smembers("online_users");
      return res.status(200).json({ executes: Number(executes), online });
    }

    // 📌 RESET
    if (action === "reset" && req.method === "GET") {
      await redis.set("executes", 0);
      await redis.del("online_users");
      return res.status(200).json({ message: "Reset done" });
    }

    return res.status(400).json({ error: "Invalid action or method" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
