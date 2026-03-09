[10:23 PM, 3/9/2026] ABHISHEK CHOUDHARY: const express = require('express');

const aiController = require("../controllers/ai.controller")

const router = express.Router();

router.post("/get-review",aiController.getReview)


module.exports = router;
[10:24 PM, 3/9/2026] ABHISHEK CHOUDHARY: const express = require("express");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

// simple rate limit middleware
const requestMap = new Map();

function rateLimiter(req, res, next) {

  const ip = req.ip;
  const now = Date.now();
  const windowTime = 10 * 1000; // 10 seconds

  if (requestMap.has(ip)) {

    const lastRequest = requestMap.get(ip);

    if (now - lastRequest < windowTime) {
      return res.status(429).json({
        error: "Too many requests. Please wait a few seconds."
      });
    }

  }

  requestMap.set(ip, now);

  next();
}

// AI review route
router.post("/get-review", rateLimiter, aiController.getReview);

module.exports = router;
