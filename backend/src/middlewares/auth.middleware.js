const foodPartnerModel = require("../models/foodPartner.model");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const getTokenFromReq = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

// Protect partner-only routes: ensures only valid Food Partners can access
const authFoodPartnerMiddleware = async (req, res, next) => {
  const token = getTokenFromReq(req);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required. Please login as a Food Partner.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const foodPartner = await foodPartnerModel.findById(decoded.id);

    if (!foodPartner) {
      // Check if it's a regular user trying to access partner routes
      const user = await userModel.findById(decoded.id);
      if (user) {
        return res.status(403).json({
          message: "Access forbidden: Food Partner account required for this action.",
        });
      }
      return res.status(401).json({
        message: "Food Partner account not found.",
      });
    }

    req.foodPartner = foodPartner;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// Authenticate regular users (or partners browsing user feed)
const authUserMiddleware = async (req, res, next) => {
  const token = getTokenFromReq(req);

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      // Allow foodPartner to view feed as well
      const partner = await foodPartnerModel.findById(decoded.id);
      if (partner) {
        req.user = partner;
        req.foodPartner = partner;
        return next();
      }
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = {
  authFoodPartnerMiddleware,
  authUserMiddleware,
};