const User = require("../model/user");

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded.email;

    // Query for the user with the provided email
    const user = await User.findOne({ email });

    // Check if the user exists and if their role is 'admin'
    const isAdmin = user?.role === "admin";

    if (!isAdmin) {
      return res.status(403).send({ message: "Access forbidden" });
    }

    next(); // Proceed to the next middleware if the user is an admin
  } catch (err) {
    res.status(500).send({ message: "Server error", error: err.message });
  }
};

module.exports = verifyAdmin;
