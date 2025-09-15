let count = 0;
let onlineUsers = new Set();

export default function handler(req, res) {
  if (req.url === "/api/execute" && req.method === "POST") {
    const { username, userid } = req.body;
    count++;
    if (username && userid) {
      onlineUsers.add(`${username} (${userid})`);
    }
    res.status(200).json({ executes: count, online: Array.from(onlineUsers) });
  }
  else if (req.url === "/api/status" && req.method === "GET") {
    res.status(200).json({ executes: count, online: Array.from(onlineUsers) });
  }
  else if (req.url === "/api/reset" && req.method === "GET") {
    count = 0;
    onlineUsers.clear();
    res.status(200).json({ message: "Reset done" });
  }
  else {
    res.status(404).json({ error: "Not found" });
  }
}
