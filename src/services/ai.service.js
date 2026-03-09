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

Think step-by-step internally before answering, but present only structured final output.

Focus on:
- Code correctness
- Edge cases
- Error handling
- Performance complexity (Big-O if relevant)
- Security vulnerabilities
- Clean architecture principles
- SOLID principles
- Scalability concerns
- Maintainability

Avoid generic advice.

If the code contains architectural issues, suggest redesign patterns.

If applicable:
- Suggest design patterns
- Suggest refactoring strategies
- Suggest test cases
- Suggest monitoring/logging improvements

Output must be structured and concise.`,

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
    });

    // safe response parsing
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty AI response");
    }

    return text;

  } catch (error) {

    console.error("Gemini API Error:", error.message);

    // retry if rate limit
    if (retries > 0) {

      console.log(Retrying AI request... (${retries}));

      await delay(3000);

      return generateContent(prompt, retries - 1);
    }

    throw error;
  }
}

module.exports = generateContent;
