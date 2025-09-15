local Webhook_URL = "https://discord.com/api/webhooks/1381494567345586218/8nG9n3qgyC_fHyn1bHRan-4AVXOj0p_wkBw6vN8z81T6alBqmYB3wBdkI-9_IJH6dhiu"
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
