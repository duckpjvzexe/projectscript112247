let count = 0;
let onlineUsers = new Set();

export default function handler(req, res) {
  count = 0;
  onlineUsers.clear();
  res.status(200).json({ message: "Reset done" });
}
