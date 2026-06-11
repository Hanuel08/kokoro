import { OpenRouter } from '@openrouter/sdk';


export async function openRouter2() {
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const MODEL_AI = import.meta.env.VITE_MODEL_AI;
  const SITE_URL = import.meta.env.VITE_SITE_URL;

  const client = new OpenRouter({
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': SITE_URL, // Optional. Site URL for rankings on openrouter.ai.
      //'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    },
  });

  const completion = await client.chat.send({
    chatRequest: {
        model: MODEL_AI,
        messages: [
            {
                role: 'user',
                content: 'What is the meaning of life?',
            }
        ]
    }
  });

  console.log(completion.choices[0].message.content);
  console.log(completion);
``
}