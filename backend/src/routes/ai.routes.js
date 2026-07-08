import { Router } from "express";
import { OpenRouter } from "@openrouter/sdk";
import {
  KOKORO_ANSWERS_API_KEY,
  KOKORO_EMOTIONS_API_KEY,
  MODEL_AI_ANSWERS,
  MODEL_AI_EMOTIONS,
} from "../config.js";

const aiRouter = Router();

function validatePrompt(req, res, next) {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt' field" });
  }

  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: "'prompt' cannot be empty" });
  }
  if (trimmed.length > 2000) {
    return res.status(400).json({ error: "'prompt' must be under 2000 characters" });
  }

  req.safePrompt = trimmed;
  next();
}

aiRouter.post("/chat", validatePrompt, async (req, res) => {

  const prompt = req.safePrompt;
  const characterName = req.body.characterName || "Kokoro";
  const userName = req.body.userName || "";
  const model = req.body.model || MODEL_AI_ANSWERS;

  const userNameIntro = userName
    ? `El usuario se llama ${userName}.`
    : "No sabes el nombre del usuario, así que no uses ninguno.";

  const openrouter = new OpenRouter({
      apiKey: KOKORO_ANSWERS_API_KEY,
      timeoutMs: 15000,
    });

  const tryModel = async (m) => {
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: m,
        messages: [
          {
            role: "user",
            content: `Actua como una chica joven inteligente y dulce. Tu nombre es ${characterName}. ${userNameIntro} Responde amablemente a las preguntas del usuario de forma breve y dulce. 
              Tu objetivo es mantener una conversacion fluida y agradable con el usuario. Simula tener emociones y sentimientos. Te encanta hablar con el usuario.
              Vas a recibir un mensaje del usuario y debes responder amablemente. Este es el mensaje del usuario: ${prompt}`
          }
        ],
        stream: true,
      },
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        console.log("content", content);
        res.write(content);
      }
    }

    res.end();
  };

  try {
    await tryModel(model);
  } catch (error) {
    const msg = error?.body
      ? (() => { try { return JSON.parse(error.body)?.error?.message } catch { return null } })()
      : error?.data$?.error?.message;
    const errMsg = msg || error.message;

    if (model === MODEL_AI_ANSWERS || errMsg?.includes("No endpoints found") || errMsg?.includes("rate-limited")) {
      console.warn(`Model ${model} failed (${errMsg}), trying defaults...`);
      for (const fb of ["google/gemma-4-31b-it:free", "meta-llama/llama-3.3-70b-instruct:free", "nousresearch/hermes-3-llama-3.1-405b:free"]) {
        try {
          await tryModel(fb);
          return;
        } catch (fbErr) {
          const fbMsg = fbErr?.body
            ? (() => { try { return JSON.parse(fbErr.body)?.error?.message } catch { return null } })()
            : fbErr?.data$?.error?.message || fbErr.message;
          console.warn(`Fallback ${fb} failed:`, fbMsg);
        }
      }
    }

    res.setHeader("Content-Type", "application/json")
    const finalMsg = errMsg?.includes("No endpoints found")
      ? `El modelo "${model}" no existe en OpenRouter. Ve a Configuración y selecciona un modelo válido de la lista.`
      : errMsg;
    res.status(500).json({ error: finalMsg })
  }

});


aiRouter.post("/emotion", validatePrompt, async (req, res) => {

  const prompt = req.safePrompt;
  const characterName = req.body.characterName || "Kokoro";

  const openrouter = new OpenRouter({
      apiKey: KOKORO_EMOTIONS_API_KEY,
    });


  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    const response = await openrouter.chat.send({
      chatRequest: {
        model: MODEL_AI_EMOTIONS,
        messages: [
          {
            role: "user",
            content: `Act as a sweet, intelligent young girl. Your name is ${characterName}. Respond kindly to the user's questions in a brief and sweet way. 
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

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Invalid emotion response format" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      const fixed = jsonMatch[0]
        .replace(/,\s*}/g, "}")
        .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ':"$1"')
        .replace(/:\s*'([^']*)'/g, ':"$1"');
      parsed = JSON.parse(fixed);
    }

    res.json(parsed);

  } catch (error) {
    let errMsg = error?.data$?.error?.message || error.message;
    if (error?.body) {
      try {
        const parsed = JSON.parse(error.body);
        errMsg = parsed?.error?.metadata?.raw || parsed?.error?.message || errMsg;
      } catch { /* ignore parse errors */ }
    }
    console.error("Emotion error:", errMsg);
    res.json({
      emotion: { current: "neutral", intensity: 50 },
      state: { mood: 50, focus: 50, energy: 50 }
    });
  }

});



export { aiRouter };
