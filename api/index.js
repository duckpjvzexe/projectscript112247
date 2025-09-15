
let executes = 0;
let onlineUsers = new Map(); // key = userid, value = { username, lastSeen }

function cleanup() {
  const now = Date.now();
  for (const [userid, info] of onlineUsers.entries()) {
    if (now - info.lastSeen > 60000) {
      onlineUsers.delete(userid);
    }
  }
}

export default async function handler(req, res) {
  const action = req.query.action;

  try {
    let body = {};
    if (req.method === "POST") {
      try {
        body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      } catch {
        body = {};
      }
    }

    // 📌 EXECUTE
    if (action === "execute" && req.method === "POST") {
      const { username, userid } = body;
      executes++;

      if (username && userid) {
        onlineUsers.set(userid, { username, lastSeen: Date.now() });
      }

      cleanup();

      return res.status(200).json({
        executes,
        online: Array.from(onlineUsers.values()).map(
          (u) => `${u.username}`
        )
      });
    }

    // 📌 STATUS
    if (action === "status" && req.method === "GET") {
      cleanup();
      return res.status(200).json({
        executes,
        online: Array.from(onlineUsers.values()).map(
          (u) => `${u.username}`
        )
      });
    }

    // 📌 RESET
    if (action === "reset" && req.method === "GET") {
      executes = 0;
      onlineUsers.clear();
      return res.status(200).json({ message: "Reset done" });
    }

    return res.status(400).json({ error: "Invalid action or method" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
