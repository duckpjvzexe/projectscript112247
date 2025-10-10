local Webhook_URL = "https://discord.com/api/webhooks/1417025345537835108/jMw2w5FfUItLKxi_uOlIQ4_xpYIHdVRZvIHYLQFl6tSoFjcF8FbMHWGi2UEUOlao78z6"
local requestFunction =
    (syn and syn.request) or
    (http and http.request) or
    http_request or
    request or
    (fluxus and fluxus.request)

local player = game:GetService("Players").LocalPlayer
local HttpService = game:GetService("HttpService")

local function sendExecuteWebhook()
    if Webhook_URL == "" or not requestFunction then return end
    
    local currentTime = os.date("%H:%M:%S")
    local gameName = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId).Name or "Unknown Game"
    local gameId = tostring(game.PlaceId)

    local data = {
        ["content"] = "",
        ["embeds"] = {{
            ["title"] = "🚀 Script Executed!",
            ["color"] = tonumber(0x00FF00),
            ["fields"] = {
                {
                    ["name"] = "👤 Username",
                    ["value"] = player.Name,
                    ["inline"] = true
                },
                {
                    ["name"] = "🆔 UserId",
                    ["value"] = tostring(player.UserId),
                    ["inline"] = true
                },
                {
                    ["name"] = "🎮 Game Name",
                    ["value"] = gameName,
                    ["inline"] = false
                },
                {
                    ["name"] = "🌐 Game ID",
                    ["value"] = gameId,
                    ["inline"] = true
                }
            },
            ["footer"] = { ["text"] = "Time: " .. currentTime }
        }}
    }

    requestFunction({
        Url = Webhook_URL,
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = HttpService:JSONEncode(data)
    })
end

sendExecuteWebhook()
