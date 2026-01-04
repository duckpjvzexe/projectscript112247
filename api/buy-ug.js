export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const { user_token, localstorage } = req.body || {};

    if (!user_token || !localstorage) {
        return res.status(400).json({
            success: false,
            message: "Thiếu user_token hoặc localstorage"
        });
    }

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
            `https://hoang.cloud/dev/check_status_ugphone?token=${user_token}`
        );

        const stockText = await stockRes.text();

        if (stockText.startsWith("<")) {
            throw new Error("Stock API trả HTML");
        }

        const stockJson = JSON.parse(stockText);

        if (!stockJson.success) {
            throw new Error("Check stock thất bại");
        }

        const availableServers = Object.entries(stockJson.data)
            .filter(([_, v]) => v === true)
            .map(([k]) => SERVER_MAP[k]);

        if (!availableServers.length) {
            return res.json({
                success: false,
                message: "Không có server UGPhone còn hàng"
            });
        }

        // 2️⃣ Random server
        const server =
            availableServers[Math.floor(Math.random() * availableServers.length)];

        // 3️⃣ Buy
        const buyRes = await fetch(
            "https://hoang.cloud/dev/buy_device_cloud",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_token,
                    cloud_id: "UG",
                    server,
                    input_data: localstorage
                })
            }
        );

        const buyText = await buyRes.text();

        if (buyText.startsWith("<")) {
            throw new Error("Buy API trả HTML");
        }

        return res.json({
            success: true,
            server,
            result: JSON.parse(buyText)
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
