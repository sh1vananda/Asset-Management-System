export default async function handler(req, res) {
  const backendBase = "https://asset-management-system-production-fe3c.up.railway.app";

  const pathSegments = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : [];

  const passthroughQuery = { ...req.query };
  delete passthroughQuery.path;

  const queryString = new URLSearchParams(passthroughQuery).toString();
  const targetPath = `/${pathSegments.join("/")}`;
  const targetUrl = `${backendBase}${targetPath}${queryString ? `?${queryString}` : ""}`;

  const headers = {};
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }
  if (req.headers["content-type"]) {
    headers["Content-Type"] = req.headers["content-type"];
  }

  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());

  let body;
  if (hasBody && req.body !== undefined) {
    body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseText = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    res.status(upstream.status);
    res.setHeader("Content-Type", contentType);

    if (contentType.includes("application/json")) {
      try {
        return res.json(JSON.parse(responseText || "{}"));
      } catch {
        return res.send(responseText);
      }
    }

    return res.send(responseText);
  } catch (error) {
    return res.status(502).json({
      error: "Proxy request failed",
      details: error.message,
    });
  }
}
