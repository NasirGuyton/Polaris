function ipExtractor(req, res, next) {
  const forwarded = req.headers["x-forwarded-for"];
  req.clientIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || req.ip || null;
  next();
}

module.exports = ipExtractor;