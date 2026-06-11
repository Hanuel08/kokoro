process.loadEnvFile(".env");

import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";



const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {

  const { prompt } = req.body;

  console.log(prompt); 

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const MODEL_AI = process.env.MODEL_AI;
  //const SITE_URL = process.env.SITE_URL;
  
  const openrouter = new OpenRouter({
      apiKey: OPENROUTER_API_KEY,
      // defaultHeaders: {
      //   'HTTP-Referer': SITE_URL, // Optional. Site URL for rankings on openrouter.ai.
      //   //'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
      // },
    });


  

  
  

  try {

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    // Stream the response to get reasoning tokens in usage
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: MODEL_AI,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true
      },
    });


    let response = "";


    for await (const chunk of stream) {
      //console.log("chunk", chunk)

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        console.log("content", content);
        res.write(content);
        //response += content;
        //process.stdout.write(content);
      }

      // Usage information comes in the final chunk
      // if (chunk.usage) {
      //   res.write("\nReasoning tokens:", chunk.usage.reasoningTokens);
      // }
    }



    
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json({ error: "Error generating summary"})
      }
      return res.end()
  }

});

export { aiRouter };