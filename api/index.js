const BIN_URL = "https://api.jsonbin.io/v3/b/68c7a10bd0ea881f407e30b2";
const API_KEY = process.env.JSONBIN_KEY;

export default async function handler(req, res) {
  const action = req.query.action;

  try {
    const current = await fetch(BIN_URL + "/latest", {
      headers: { "X-Master-Key": API_KEY }
    }).then(r => r.json());

    let executes = current.record?.executes || 0;
    let online = current.record?.online || [];

    let body = {};
    if (req.method === "POST") {
      try {
        body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      } catch {
        body = {};
      }
    }

    // 🚀 EXECUTE
    if (action === "execute" && req.method === "POST") {
      const { username, userid } = body;

      executes++;
      if (username && userid) {
        if (!online.includes(username)) {
          online.push(username);
        }
      }

      const updateRes = await fetch(BIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        body: JSON.stringify({ executes, online })
      });

      if (!updateRes.ok) {
        const text = await updateRes.text();
        return res.status(500).json({ error: "Update failed", details: text });
      }

      return res.status(200).json({ executes, online });
    }

    // 📊 STATUS
    if (action === "status" && req.method === "GET") {
      return res.status(200).json({ executes, online });
    }

    // 🔄 RESET
    if (action === "reset" && req.method === "GET") {
      executes = 0;
      online = [];
      const resetRes = await fetch(BIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY
        },
        body: JSON.stringify({ executes, online })
      });

      if (!resetRes.ok) {
        const text = await resetRes.text();
        return res.status(500).json({ error: "Reset failed", details: text });
      }

      return res.status(200).json({ message: "Reset done" });
    }

    return res.status(400).json({ error: "Invalid action or method" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
