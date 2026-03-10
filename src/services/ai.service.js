require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

// Validate API key early
if (!process.env.GOOGLE_GEMINI_KEY) {
  throw new Error("GOOGLE_GEMINI_KEY environment variable is missing");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

// delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// exponential backoff delay
function backoff(attempt) {
  return 2000 * attempt;
}

async function generateContent(prompt, retries = 3) {

  try {

    console.log("🧠 Sending request to Gemini API...");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      systemInstruction: `
You are a Staff-Level Software Engineer performing a production-grade code review.

Focus on:
- Code correctness
- Edge cases
- Error handling
- Performance complexity
- Security vulnerabilities
- Clean architecture
- SOLID principles
- Scalability
- Maintainability

Avoid generic advice.
If architecture is poor suggest redesign patterns.
Output must be structured and concise.
      `,

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
    });

    // Safe parsing
    const review =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.text ||
      null;

    if (!review) {
      throw new Error("Gemini returned empty response");
    }

    console.log("✅ AI review generated");

    return review;

  } catch (error) {

    console.error("❌ Gemini API Error:", error.message);

    // retry logic
    if (retries > 0) {

      const attempt = 4 - retries;

      console.log(🔁 Retrying AI request (attempt ${attempt}));

      await delay(backoff(attempt));

      return generateContent(prompt, retries - 1);
    }

    console.error("🔥 AI service failed after retries");

    // throw controlled error
    throw new Error("AI service unavailable");
  }
}

module.exports = generateContent;
