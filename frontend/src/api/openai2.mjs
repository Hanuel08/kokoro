import { OpenRouter } from "@openrouter/sdk";


export async function openai2() {

  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const MODEL_AI = import.meta.env.VITE_MODEL_AI;
  const SITE_URL = import.meta.env.VITE_SITE_URL;

  const openrouter = new OpenRouter({
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': SITE_URL, // Optional. Site URL for rankings on openrouter.ai.
      //'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    },
  });

  // Stream the response to get reasoning tokens in usage
  const stream = await openrouter.chat.send({
    chatRequest: {
      model: MODEL_AI,
      messages: [
        {
          role: "user",
          content: "¿Cual es la capital de francia?"
        }
      ],
      stream: true
    },
  });

  let response = "";

  console.log("empieza stream", stream)

  for await (const chunk of stream) {
    //console.log("chunk", chunk)

    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      response += content;
      //process.stdout.write(content);
      //console.log("response", response)
    }

    // Usage information comes in the final chunk
    if (chunk.usage) {
      console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
    }
  }

  //console.log("\n")
  console.log("response 2 ", response);
  return response;
}