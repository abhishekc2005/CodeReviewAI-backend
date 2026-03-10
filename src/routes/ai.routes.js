const express = require("express");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

// smart rate limiter
const requestMap = new Map();

function rateLimiter(req, res, next) {

  const ip = req.ip;
  const now = Date.now();

  const windowTime = 5000; // 5 seconds

  const lastRequestTime = requestMap.get(ip);

  if (lastRequestTime && now - lastRequestTime < windowTime) {

    return res.status(429).json({
      success: false,
      error: "Please wait a few seconds before reviewing again."
    });

  }

  requestMap.set(ip, now);

  next();
}

// route
router.post("/get-review", rateLimiter, aiController.getReview);

module.exports = router;
