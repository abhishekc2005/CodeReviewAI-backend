require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GOOGLE_GEMINI_KEY) {
  throw new Error("GOOGLE_GEMINI_KEY missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function backoff(attempt) {
  return 2000 * attempt;
}

async function generateContent(prompt, retries = 3) {

  try {

    console.log("🧠 Sending request to Gemini API");

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // more stable free tier

      systemInstruction: `
You are a senior software engineer performing a professional code review.

Focus on:
- bugs
- edge cases
- performance
- security
- clean architecture
- SOLID principles

Return structured feedback.
`,

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    let review = response?.text ||
                 response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!review) {
      throw new Error("EMPTY_RESPONSE");
    }

    console.log("✅ Gemini response received");

    return review;

  } catch (error) {

    console.error("❌ Gemini Error:", error.message);

    // detect quota exceeded
    if (
      error.message.includes("quota") ||
      error.message.includes("429") ||
      error.message.includes("RESOURCE_EXHAUSTED")
    ) {
      throw new Error("QUOTA_EXCEEDED");
    }

    if (retries > 0) {

      const attempt = 4 - retries;

      console.log(🔁 Retrying AI request (attempt ${attempt}));

      await delay(backoff(attempt));

      return generateContent(prompt, retries - 1);
    }

    throw new Error("AI_SERVICE_FAILED");
  }

}

module.exports = generateContent;
