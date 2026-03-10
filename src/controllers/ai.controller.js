const aiService = require("../services/ai.service");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.getReview = async (req, res) => {

  try {

    console.log("📥 AI Review request received");

    const code = req?.body?.code;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Code is required"
      });
    }

    console.log("🧠 Code length:", code.length);

    // small delay to reduce API spam
    await delay(2000);

    const review = await aiService(code);

    if (!review) {
      return res.status(500).json({
        success: false,
        error: "AI returned empty response"
      });
    }

    console.log("✅ AI review generated");

    return res.status(200).json({
      success: true,
      review
    });

  } catch (error) {

    console.error("🔥 AI Controller Error:", error.message);

    // quota exceeded
    if (error.message === "QUOTA_EXCEEDED") {
      return res.status(429).json({
        success: false,
        error: "AI quota exceeded. Please try again later."
      });
    }

    // AI service failure
    if (error.message === "AI_SERVICE_FAILED") {
      return res.status(500).json({
        success: false,
        error: "AI service temporarily unavailable"
      });
    }

    return res.status(500).json({
      success: false,
      error: "Unexpected server error"
    });

  }

};
