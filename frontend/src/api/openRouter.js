import { helpHttp } from "../helpers/helpHttp";

export function openRouter () {
  const { post } = helpHttp();
  const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
  const SITE_URL = "http://localhost/";

  post("https://openrouter.ai/api/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': SITE_URL, // Optional. Site URL for rankings on openrouter.ai.
      //'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-5.2',
      messages: [
        {
          role: 'user',
          content: 'What is the meaning of life?',
        },
      ],
    }),
    
  })
  .then(
    res => console.log(res)
  )
}