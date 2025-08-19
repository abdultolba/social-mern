import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
const { SECRET_KEY } = process.env;

const isAuth = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ code: 401, message: "Authentication token is required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    // Check if user exists in the database
    const user = await User.findByPk(decoded.data.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found." });
    }

    req.user = user.get({ plain: true }); // Attach user to request
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ code: 401, message: "Session expired." });
    }
    return res.status(401).json({ code: 401, message: "Invalid token." });
  }
};

export default { isAuth };
