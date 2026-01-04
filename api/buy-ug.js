export default async function handler(req, res) {
    // ✅ CORS HEADERS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // ✅ Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { user_token, localstorage } = req.body;

    if (!user_token || !localstorage) {
        return res.status(400).json({
            success: false,
            message: "Thiếu user_token hoặc localstorage"
        });
    }

    const API_BASE = "https://hoang.cloud";

    const SERVER_MAP = {
        America: "US",
        Germany: "DE",
        Singapore: "SG",
        "Hong Kong": "HK",
        Japan: "JP"
    };

    try {
        // 1️⃣ Check stock
        const stockRes = await fetch(
            `${API_BASE}/dev/check_status_ugphone?token=${user_token}`
        );

        const stockJson = await stockRes.json();

        if (!stockJson.success) {
            throw new Error("Check stock thất bại");
        }

        // 2️⃣ Server còn hàng
        const availableServers = Object.entries(stockJson.data)
            .filter(([_, v]) => v === true)
            .map(([k]) => SERVER_MAP[k]);

        if (!availableServers.length) {
            return res.json({
                success: false,
                message: "Không có server UGPhone còn hàng"
            });
        }

        // 3️⃣ Random server
        const server =
            availableServers[Math.floor(Math.random() * availableServers.length)];

        // 4️⃣ Mua máy
        const buyRes = await fetch(`${API_BASE}/dev/buy_device_cloud`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_token,
                cloud_id: "UG",
                server,
                input_data: localstorage
            })
        });

        const buyJson = await buyRes.json();

        return res.json({
            success: true,
            selected_server: server,
            result: buyJson
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
