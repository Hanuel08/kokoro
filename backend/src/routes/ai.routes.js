process.loadEnvFile(".env");

import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";



const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {

  const { prompt } = req.body;

  //console.log(prompt); 

  const KOKORO_ANSWERS_API_KEY = process.env.KOKORO_ANSWERS_API_KEY;
  const MODEL_AI = process.env.MODEL_AI_ANSWERS;
  
  const openrouter = new OpenRouter({
      apiKey: KOKORO_ANSWERS_API_KEY,
    
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
            content: `Actua como una chica joven inteligente y dulce. Tu nombre es Kokoro. Responde amablemente a las preguntas del usuario de forma breve y dulce. 
              Tu objetivo es mantener una conversacion fluida y agradable con el usuario. Simula tener emociones y sentimientos. Te encanta hablar con el usuario.
              Vas a recibir un mensaje del usuario y debes responder amablemente. Este es el mensaje del usuario: ${prompt}`
          }
        ],
        stream: true
      },
    });


    //let response = "";

    for await (const chunk of stream) {
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


aiRouter.post("/emotion", async (req, res) => {

  const { prompt } = req.body;

  console.log(`ESOY DESDE EMOTION: ${prompt}`); 

  const KOKORO_EMOTIONS_API_KEY = process.env.KOKORO_EMOTIONS_API_KEY;
  const MODEL_AI = process.env.MODEL_AI_EMOTIONS;
  
  const openrouter = new OpenRouter({
      apiKey: KOKORO_EMOTIONS_API_KEY,
    });


  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    const response = await openrouter.chat.send({
      chatRequest: {
        model: MODEL_AI,
        messages: [
          {
            role: "user",
            content: `Act as a sweet, intelligent young girl. Your name is Kokoro. Respond kindly to the user's questions in a brief and sweet way. 
              Your goal is to maintain a fluid and pleasant conversation with the user. Pretend to have emotions and feelings. You tend to be charming, sweet, and outgoing. 
              You loves to chat with the user. Given the user's message and conversation history: "${prompt}" Determine which of the following emotions is most strongly 
              represented in the message and which emotion you need to respond with: happy, sad, angry, surprised, excited, fear, love, hate, disgust, thinking, neutral. 
              Finally, determine your mood, focus, and energy levels, always in numbers between 0 and 100.
              Respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text) in this exact format: 
              {
                "emotion": {
                  "current": "happy",
                  "intensity": 80
                },
                "state": {
                  "mood": 75,
                  "focus": 90,
                  "energy": 85
                }
              }`
          }
        ],
      },
    });

    const raw = response.choices[0].message.content.trim();
    console.log("RAW emotion response:", raw);

    // Try to extract JSON object from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid emotion response format" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // If strict JSON fails, try to fix common issues
      const fixed = jsonMatch[0]
        .replace(/,\s*}/g, "}")           // trailing commas
        .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')  // unquoted keys
        .replace(/:\s*'([^']*)'/g, ':"$1"')          // single to double quotes
        .replace(/:\s*'([^']*)'/g, ':"$1"');         // single to double quotes (nested)
      parsed = JSON.parse(fixed);
    }

    res.json(parsed);

  } catch (error) {
    console.error("Emotion error:", error.message);
    // Fallback: return neutral instead of crashing
    res.json({
      emotion: { current: "neutral", intensity: 50 },
      state: { mood: 50, focus: 50, energy: 50 }
    });
  }

});



export { aiRouter };