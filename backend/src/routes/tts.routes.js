import { Router } from "express";
import { UNREAL_API_KEY } from "../config.js";

const ttsRouter = Router();

ttsRouter.post("/tts", async (req, res) => {
  const { text, voice } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  if (!UNREAL_API_KEY) {
    return res.status(500).json({ error: "TTS API key not configured on server" });
  }

  try {
    const response = await fetch("https://api.v8.unrealspeech.com/stream", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UNREAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Text: text,
        VoiceId: voice || "Scarlett",
        Bitrate: "192k",
        Pitch: 1.0,
        Speed: 0.0,
      }),
    });

    if (!response.ok) {
      console.error("Unreal Speech error:", response.status);
      return res.status(502).json({ error: "TTS service error" });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/wav");
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error("TTS error:", error.message);
    res.status(500).json({ error: "TTS processing error" });
  }
});

export { ttsRouter };
