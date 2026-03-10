const aiService = require("../services/ai.service");

// delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.getReview = async (req, res) => {

  try {

    console.log("📥 AI Review request received");

    // safe body parsing
    const code = req?.body?.code;

    if (!code || code.trim().length === 0) {
      console.log("⚠️ No code received in request");

      return res.status(400).json({
        success: false,
        error: "Code is required"
      });
    }

    console.log("🧠 Code length:", code.length);

    // delay to avoid rate limit
    await delay(2000);

    console.log("⚡ Sending code to AI service...");

    // call AI service
    const review = await aiService(code);

    console.log("✅ AI response received");

    if (!review) {
      console.log("❌ AI returned empty response");

      return res.status(500).json({
        success: false,
        error: "AI returned empty response"
      });
    }

    // success response
    return res.status(200).json({
      success: true,
      review
    });

  } catch (error) {

    console.error("🔥 AI Controller Error:", error);

    return res.status(500).json({
      success: false,
      error: "AI review failed. Try again later."
    });

  }

};
