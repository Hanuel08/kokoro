import { OpenRouter } from "@openrouter/sdk";

export async function deepseek() {
  const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

  const openrouter = new OpenRouter({
    apiKey: OPENROUTER_API_KEY
  });

  // Stream the response to get reasoning tokens in usage
  const stream = await openrouter.chat.send({
    model: "deepseek/deepseek-v4-flash:free",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?"
      }
    ],
    stream: true
  });

  let response = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      response += content;
      process.stdout.write(content);
    }

    // Usage information comes in the final chunk
    if (chunk.usage) {
      console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
      console.log(response)
    }
  }
  
}