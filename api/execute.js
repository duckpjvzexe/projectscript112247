let count = 0;
let onlineUsers = new Set();

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { username, userid } = req.body;
      count++;
      if (username && userid) {
        onlineUsers.add(`${username} (${userid})`);
      }
      res.status(200).json({ executes: count, online: Array.from(onlineUsers) });
    } catch (e) {
      res.status(400).json({ error: "Invalid request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
