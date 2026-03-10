require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GOOGLE_GEMINI_KEY) {
  throw new Error("GOOGLE_GEMINI_KEY missing");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function backoff(attempt) {
  return 2000 * attempt;
}

async function generateContent(prompt, retries = 3) {

  try {

    console.log("🧠 Sending request to Gemini");

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      systemInstruction: `
You are a Staff-Level Software Engineer performing a professional code review.

Focus on:
- Bugs
- Edge cases
- Error handling
- Performance
- Security
- Clean architecture
- SOLID principles

Give structured feedback.
`,

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
    });

    let review = null;

    if (response?.text) {
      review = response.text;
    }

    if (!review && response?.candidates?.length) {
      review = response.candidates[0]?.content?.parts?.[0]?.text;
    }

    if (!review) {
      throw new Error("Gemini returned empty response");
    }

    console.log("✅ Gemini response received");

    return review;

  } catch (error) {

    console.error("❌ Gemini Error:", error.message);

    if (retries > 0) {

      const attempt = 4 - retries;

      console.log(🔁 Retrying AI request (attempt ${attempt}));

      await delay(backoff(attempt));

      return generateContent(prompt, retries - 1);
    }

    throw new Error("AI service unavailable");
  }
}

module.exports = generateContent;
