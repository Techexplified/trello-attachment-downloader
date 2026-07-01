export default async function handler(req, res) {
  const { url, token } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });
  if (!token) return res.status(400).json({ error: "No token provided" });

  try {
    const key = process.env.TRELLO_API_KEY;

    // Trello's /download/ (S3-backed) route rejects key/token as query params —
    // it only accepts them via the Authorization header. Query params still work
    // for regular api.trello.com calls, but attachment downloads need this.
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'Accept': '*/*',
        'Authorization': `OAuth oauth_consumer_key="${key}", oauth_token="${token}"`,
      }
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: `Trello returned ${response.status}`,
        detail: bodyText.slice(0, 300),
      });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}