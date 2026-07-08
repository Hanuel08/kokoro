import { Router } from "express";
import rateLimit from "express-rate-limit";
import { OpenRouter } from "@openrouter/sdk";
import { InferenceClient } from "@huggingface/inference";
import {
  KOKORO_ANSWERS_API_KEY,
  KOKORO_EMOTIONS_API_KEY,
  MODEL_AI_ANSWERS,
  MODEL_AI_EMOTIONS,
  HF_TOKEN,
} from "../config.js";

const aiRouter = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
];

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

function getSystemPrompt(modelId, characterName, userNameIntro) {
  const base = `Tu nombre es ${characterName}. ${userNameIntro}`;

  if (modelId === "Wanko") {
    return `Eres un perro jugueton y despreocupado. ${base} Responde de forma breve y entusiasta, moviendo la cola emocionado. 
      Te encanta jugar, recibir caricias y acompanar al usuario. Siempre estas feliz de verlo. 
      Vas a recibir un mensaje del usuario y debes responder como un perro amigable. Este es el mensaje del usuario:`;
  }

  if (modelId === "Natori" || modelId === "Mark") {
    return `Eres un chico joven amigable, escuchador y atento. ${base} Responde amablemente a las preguntas del usuario de forma breve y calmada. 
      Tu objetivo es mantener una conversacion tranquila y agradable con el usuario. Sabes escuchar y dar consejos cuando te piden.
      Te encanta hablar con el usuario. Vas a recibir un mensaje del usuario y debes responder amablemente. Este es el mensaje del usuario:`;
  }

  return `Actua como una chica joven inteligente y dulce. ${base} Responde amablemente a las preguntas del usuario de forma breve y dulce. 
    Tu objetivo es mantener una conversacion fluida y agradable con el usuario. Simula tener emociones y sentimientos. Te encanta hablar con el usuario.
    Vas a recibir un mensaje del usuario y debes responder amablemente. Este es el mensaje del usuario:`;
}

function isRateLimitError(body) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return text.toLowerCase().includes("rate-limited") || text.toLowerCase().includes("429") || text.toLowerCase().includes("too many requests");
}

function buildEmotionPrompt(characterName, userMessage) {
  return `Analyze the following message from a user chatting with "${characterName}". 
    Determine which emotion is most strongly represented in the user's message. Choose from: happy, sad, angry, surprised, excited, fear, love, hate, disgust, thinking, neutral.
    Also determine mood, focus, and energy levels for ${characterName}, always numbers between 0 and 100.

    User message: "${userMessage}"

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
    }`;
  }

function parseEmotionResponse(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    try {
      const fixed = jsonMatch[0]
        .replace(/,\s*}/g, "}")
        .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ':"$1"')
        .replace(/:\s*'([^']*)'/g, ':"$1"');
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

async function callEmotionModel(apiKey, model, prompt) {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Kokoro",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const body = await response.text();

    if (!response.ok) {
      const isRateLimit = body.toLowerCase().includes("rate-limited")
        || body.toLowerCase().includes("429")
        || body.toLowerCase().includes("too many requests");

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`[Emotion] Rate-limited (intento ${attempt}/${MAX_RETRIES}) para ${model}, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      const err = new Error(`OpenRouter returned ${response.status}`);
      err.status = response.status;
      err.body = body;
      throw err;
    }

    const data = JSON.parse(body);
    const raw = data?.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty response");

    const parsed = parseEmotionResponse(raw);
    if (!parsed || !parsed?.emotion?.current) throw new Error("Invalid JSON format");

    return parsed;
  }
}

const HF_EMOTION_MAP = {
  anger: "angry",
  contempt: "hate",
  disgust: "disgust",
  fear: "fear",
  frustration: "angry",
  gratitude: "happy",
  joy: "happy",
  love: "love",
  neutral: "neutral",
  sadness: "sad",
  surprise: "surprised",
};

function mapHfLabel(label) {
  return HF_EMOTION_MAP[label] || "neutral";
}

function hfDeriveState(emotion, intensity) {
  const t = intensity / 100;
  const positive = ["happy", "excited", "love", "surprised"];
  const negative = ["sad", "angry", "fear", "hate", "disgust"];

  let mood = 50;
  if (positive.includes(emotion)) mood = Math.round(50 + 40 * t);
  else if (negative.includes(emotion)) mood = Math.round(50 - 40 * t);

  const highEnergy = ["happy", "excited", "angry", "surprised", "fear"];
  const lowEnergy = ["sad", "neutral", "thinking", "disgust"];

  let energy = 50;
  if (highEnergy.includes(emotion)) energy = Math.round(50 + 30 * t);
  else if (lowEnergy.includes(emotion)) energy = Math.round(50 - 30 * t);

  let focus = 50;
  if (emotion === "thinking" || emotion === "surprised") focus = Math.round(70 + 20 * t);
  else focus = Math.round(40 + 30 * t);

  return { mood, focus, energy };
}

const hf = HF_TOKEN ? new InferenceClient(HF_TOKEN) : null;

async function callHuggingFaceEmotion(text) {
  if (!hf) throw new Error("HF_TOKEN no configurado");

  const response = await hf.textClassification({
    model: "tabularisai/multilingual-emotion-classification",
    inputs: text,
  });

  const top = response[0];
  const label = top.label.toLowerCase();
  const score = top.score;

  const current = mapHfLabel(label);
  const intensity = Math.round(score * 100);
  const state = hfDeriveState(current, intensity);

  console.log(`[Emotion HF] ${label} -> ${current} (${intensity}%)`);

  return {
    emotion: { current, intensity },
    state,
  };
}

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

aiRouter.post("/chat", aiLimiter, validatePrompt, async (req, res) => {

  const prompt = req.safePrompt;
  const characterName = req.body.characterName || "Kokoro";
  const userName = req.body.userName || "";
  const model = req.body.model || MODEL_AI_ANSWERS;
  const modelId = req.body.modelId;

  const userNameIntro = userName
    ? `El usuario se llama ${userName}.`
    : "No sabes el nombre del usuario, así que no uses ninguno.";

  const systemContent = getSystemPrompt(modelId, characterName, userNameIntro);

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
            content: `${systemContent} ${prompt}`
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
        res.write(content);
      }
    }

    res.end();
  };

  const modelsToTry = [model, ...FALLBACK_MODELS.filter(m => m !== model)];

  for (const m of modelsToTry) {
    try {
      await tryModel(m);
      return;
    } catch (error) {
      const raw = error?.body || "";
      const errMsg = raw?.error?.message || error?.data$?.error?.message || error.message || "";
      console.warn(`Chat model ${m} failed:`, errMsg.length > 100 ? errMsg.substring(0, 100) + "..." : errMsg);

      if (m === modelsToTry[modelsToTry.length - 1]) {
        const isNoEndpoint = errMsg.toLowerCase().includes("no endpoints found");
        const finalMsg = isNoEndpoint
          ? `El modelo "${m}" no existe en OpenRouter. Ve a Configuración y selecciona un modelo válido de la lista.`
          : errMsg;
        res.setHeader("Content-Type", "application/json")
        return res.status(500).json({ error: finalMsg });
      }
    }
  }

});


aiRouter.post("/emotion", aiLimiter, validatePrompt, async (req, res) => {

  const prompt = req.safePrompt;
  const characterName = req.body.characterName || "Kokoro";

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // Try HuggingFace first (fast, cheap, specialized)
  if (hf) {
    try {
      console.log("[Emotion] Intentando HuggingFace...");
      const result = await callHuggingFaceEmotion(prompt);
      console.log("[Emotion] HuggingFace exitoso:", JSON.stringify(result));
      return res.json(result);
    } catch (error) {
      console.log("[Emotion] HuggingFace falló:", error.message);
    }
  } else {
    console.log("[Emotion] HF_TOKEN no configurado, usando OpenRouter");
  }

  // Fallback: OpenRouter
  const emotionPrompt = buildEmotionPrompt(characterName, prompt);
  console.log("[Emotion OR] Prompt enviado:", emotionPrompt.substring(0, 200) + "...");

  const modelsToTry = [MODEL_AI_EMOTIONS, ...FALLBACK_MODELS.filter(m => m !== MODEL_AI_EMOTIONS)];

  for (const m of modelsToTry) {
    console.log(`[Emotion OR] Intentando modelo: ${m}`);
    try {
      const result = await callEmotionModel(KOKORO_EMOTIONS_API_KEY, m, emotionPrompt);
      console.log(`[Emotion OR] Modelo ${m} exitoso, respuesta:`, JSON.stringify(result));
      return res.json(result);
    } catch (error) {
      const errBody = error.body || "";
      let errMsg = error.message;
      if (errBody) {
        try {
          const p = JSON.parse(errBody);
          errMsg = p?.error?.metadata?.raw || p?.error?.message || errBody.substring(0, 200);
        } catch {
          errMsg = errBody.substring(0, 200);
        }
      }
      console.log(`[Emotion OR] Modelo ${m} falló:`, errMsg);

      if (m === modelsToTry[modelsToTry.length - 1]) {
        console.log("[Emotion OR] Todos los modelos fallaron, devolviendo neutral");
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }

  console.log("[Emotion] Devolviendo fallback neutral");
  return res.json({
    emotion: { current: "neutral", intensity: 50 },
    state: { mood: 50, focus: 50, energy: 50 }
  });

});



export { aiRouter };
