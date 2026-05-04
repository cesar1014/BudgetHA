export function createSecurityHeadersMiddleware({
  defaultSecurityHeaders,
  contentSecurityPolicy,
  shouldEnableHsts,
}) {
  return (req, res, next) => {
    for (const [header, value] of Object.entries(defaultSecurityHeaders)) {
      res.setHeader(header, value);
    }

    res.setHeader("Content-Security-Policy", contentSecurityPolicy);

    if (shouldEnableHsts(req)) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    if (req.path.startsWith("/api/")) {
      res.setHeader("Cache-Control", "no-store");
    }

    next();
  };
}

export function createApiOriginGuardMiddleware({ isTrustedRequestOrigin }) {
  return (req, res, next) => {
    const method = req.method.toUpperCase();
    const isStateChanging =
      method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

    if (!isStateChanging || !req.path.startsWith("/api/")) {
      next();
      return;
    }

    if (isTrustedRequestOrigin(req)) {
      next();
      return;
    }

    res.status(403).json({ error: "Origem da requisicao nao permitida." });
  };
}
