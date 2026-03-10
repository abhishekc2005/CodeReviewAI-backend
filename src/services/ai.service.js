require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_KEY,
});

// delay function to prevent rate limit
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateContent(prompt, retries = 3) {

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      systemInstruction: `You are a Staff-Level Software Engineer performing a production-grade code review.

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

If the code contains architectural issues suggest redesign patterns.

Output must be structured and concise.`,

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
    });

    // safer parsing
    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response?.text ||
      "No response generated.";

    return text;

  } catch (error) {

    console.error("Gemini API Error:", error.message);

    if (retries > 0) {

      console.log(Retrying AI request... (${retries}));

      await delay(3000);

      return generateContent(prompt, retries - 1);
    }

    throw new Error("AI service failed after retries");
  }
}

module.exports = generateContent;
