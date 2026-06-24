export default async function handler(req, res) {
  const { url, token } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });
  if (!token) return res.status(400).json({ error: "No token provided" });

  try {
    const key = process.env.TRELLO_API_KEY;
    const decodedUrl = decodeURIComponent(url);
    const sep = decodedUrl.includes('?') ? '&' : '?';
    const finalUrl = `${decodedUrl}${sep}key=${key}&token=${token}`;

    const response = await fetch(finalUrl, {
      redirect: 'follow',
      headers: {
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Trello returned ${response.status}`,
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