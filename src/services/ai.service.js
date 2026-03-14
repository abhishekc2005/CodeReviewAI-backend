const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateContent(prompt) {

  try {

    console.log("Sending request to Groq AI...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are a Staff-Level Software Engineer performing a professional code review.

Return structured feedback with these sections:

1. Code Quality
2. Bugs / Issues
3. Performance Improvements
4. Security Concerns
5. Best Practices
6. Suggested Refactoring
7. Example Improved Code (if needed)

Focus on real engineering improvements.
Avoid generic advice.
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.3
    });

    const response = chatCompletion.choices[0]?.message?.content;

    return response || "No review generated.";

  } catch (error) {

    console.error("Groq API Error:", error);

    throw new Error("AI service failed");

  }

}

module.exports = generateContent;
