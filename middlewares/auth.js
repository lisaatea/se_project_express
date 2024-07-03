const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

const extractBearerToken = (header) => header.replace("Bearer ", "");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(UNAUTHORIZED.code)
      .send({ message: UNAUTHORIZED.message });
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res
      .status(UNAUTHORIZED.code)
      .send({ message: UNAUTHORIZED.message });
  }

  req.user = payload;

  return next();
};

module.exports = { auth };
