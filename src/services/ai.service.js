const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateContent(prompt) {

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",

    messages: [
      {
        role: "system",
        content: `
You are a senior software engineer performing a professional code review.

Return structured feedback with:
1. Code Quality
2. Bugs / Issues
3. Performance Improvements
4. Security Concerns
5. Best Practices
`
      },
      {
        role: "user",
        content: prompt
      }
    ],

    temperature: 0.3
  });

  return response.choices[0].message.content;
}

module.exports = generateContent;
