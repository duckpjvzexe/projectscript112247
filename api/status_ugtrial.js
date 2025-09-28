import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://hoang.cloud/status_trial_ugphone";
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const servers = [];
    $(".status-card").each((i, el) => {
      const name = $(el).find(".server-name").text().trim();
      const status = $(el).find(".status-value").text().trim();
      const updated = $(el).find("#currentTime").text().trim();

      servers.push({ server: name, status, updated });
    });

    res.status(200).json({
      success: true,
      count: servers.length,
      servers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
