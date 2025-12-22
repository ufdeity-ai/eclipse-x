const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { http, https } = require("follow-redirects");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static("public"));

// Tier-2 fast proxy endpoint
app.use("/proxy", async (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing url parameter");

  // Ensure protocol
  const url = targetUrl.startsWith("http") ? targetUrl : "https://" + targetUrl;
  const client = url.startsWith("https") ? https : http;

  // Fast streaming request
  const proxyReq = client.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/117.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": url,
    },
  });

  proxyReq.on("response", (proxyRes) => {
    // Remove headers that block embedding
    delete proxyRes.headers["x-frame-options"];
    delete proxyRes.headers["content-security-policy"];

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res); // stream directly
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err.message);
    res.status(502).send("Proxy Error: " + err.message);
  });
});

// Fallback route
app.use("*", (req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Eclipse proxy running on port ${PORT}`);
  console.log("Ready for streaming Tier-2 websites!");
  console.log("Made With Passion By Ace!");
});
