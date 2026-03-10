const aiService = require("../services/ai.service");

// delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.getReview = async (req, res) => {

  try {

    // safe body parsing
    const code = req?.body?.code;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        error: "Code is required"
      });
    }

    // delay to avoid API rate limit
    await delay(2000);

    // call AI service
    const review = await aiService(code);

    if (!review) {
      return res.status(500).json({
        error: "AI returned empty response"
      });
    }

    // success response
    return res.status(200).json({
      success: true,
      review
    });

  } catch (error) {

    console.error("AI Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      error: "AI review failed. Try again later."
    });

  }

};
