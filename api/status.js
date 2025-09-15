let count = 0;
let onlineUsers = new Set();

export default function handler(req, res) {
  res.status(200).json({ executes: count, online: Array.from(onlineUsers) });
}
