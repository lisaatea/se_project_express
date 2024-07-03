module.exports = {
  INVALID_DATA: {
    code: 400,
    message: "Invalid data",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized credentials",
  },
  FORBIDDEN: {
    code: 403,
    message: "Access is denied",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found",
  },
  CONFLICT: {
    code: 409,
    message: "Duplicate record found",
  },
  SERVER_ERROR: {
    code: 500,
    message: "An error has occurred on the server",
  },
};
