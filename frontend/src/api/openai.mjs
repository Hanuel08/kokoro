//import { OpenRouter } from "@openrouter/sdk";

import OpenAI from 'openai';

// const client = new OpenAI({
//   baseURL: 'https://openrouter.ai/api/v1',
//   apiKey: import.meta.env.OPENROUTER_API_KEY
// });

export async function openai() {
  const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
  const MODEL_AI = import.meta.env.MODEL_AI;

  const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY

  // const openrouter = new OpenRouter({
  //   apiKey: OPENROUTER_API_KEY
  // });


  const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
  


  // Stream the response to get reasoning tokens in usage
  // const stream = await openrouter.chat.send({
  //   model: "deepseek/deepseek-v4-flash:free",
  //   messages: [
  //     {
  //       role: "user",
  //       content: "What is the meaning of life?"
  //     }
  //   ],
  //   stream: true
  // });


  // const ai3RateLimiter = rateLimit({
  //   windowMs: 60 * 1000, // -> 1 minuto
  //   limit: 5, // -> 5 peticiones por IP por minuto
  //   message: { error: 'Demasiadas solicitudes, por favor intenta de nuevo más tarde.' },
  //   legacyHeaders: false,
  //   standardHeaders: 'draft-8' // devuelve headers estándard RateLimit-*
  // })


  try {
    // First API call with reasoning
    const stream = await client.chat.completions.create({
      model: MODEL_AI,
      messages: [
        {
          role: 'user',
          content: "How many r's are in the word 'strawberry'?",
        },
      ],
      reasoning: { enabled: true }
    });

    for await (const part of stream) {
      const content = part.choices[0].delta.content
      if (content) {
          console.log(content);
      }
    }


  } catch(err) {
    console.error(err);
  }


  






  // let response = "";
  // for await (const chunk of stream) {
  //   const content = chunk.choices[0]?.delta?.content;
  //   if (content) {
  //     response += content;
  //     process.stdout.write(content);
  //   }

  //   // Usage information comes in the final chunk
  //   if (chunk.usage) {
  //     console.log("\nReasoning tokens:", chunk.usage.reasoningTokens);
  //     console.log(response)
  //   }
  // }
  
}