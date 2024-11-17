const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Check if the request has an Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // If the Authorization header is missing, return a 401 error
    return res
      .status(401)
      .json({ message: "Access forbidden: No token provided" });
  }

  // Extract the token from the Authorization header (assuming the format: "Bearer <token>")
  const token = authHeader.split(" ")[1];

  // Verify the token using the SECRET_TOKEN environment variable
  jwt.verify(token, process.env.SECRET_TOKEN, (error, decoded) => {
    if (error) {
      // If token verification fails, return a 401 error
      return res
        .status(401)
        .json({ message: "Access forbidden: Invalid token" });
    }

    // If token is valid, store the decoded token in the request object for future use
    req.decoded = decoded;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = verifyToken;
