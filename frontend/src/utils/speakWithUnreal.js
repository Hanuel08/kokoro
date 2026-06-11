import { helpHttp } from "../helpers/helpHttp.js"
import { unrealVoices } from "./unrealVoices.js"

export const speakWithUnreal = async ({ text = "", lang = "es", gender = "male", voice = "" }) => {
  if (text === "") return;

  const { post } = helpHttp();

  if (voice === "") voice = unrealVoices[lang].find(v => v.gender === gender)?.name;
  if (!voice) return console.error("No se encontro una voz");

  console.log({
        "Text": text,
        "VoiceId": voice,
        "Bitrate": "192k",
        "Pitch": 1.02,
        "Speed": 0.1
      })


  const options = {
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_UNREAL_API_KEY}`,
      "Content-Type": "application/json",
      "accept": "audio/wav"
    },
    body: {
        "Text": text,
        "VoiceId": voice,
        "Bitrate": "192k",
        "Pitch": 1.02,
        "Speed": 0.1
    }
  }

  post("https://api.v8.unrealspeech.com/stream", options)
    .then(res => {
      if (res.err) {
        console.error("API error:", res);
        return Promise.reject(res);
      }
      
      // 1. Extraer los datos de audio como Blob (binario), NO como text()
      return res.blob();
    })
    .then(blob => {
      // 2. Crear un object URL con el blob y reproducirlo
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      // Opcional: limpiar la memoria una vez que termine
      audio.onended = () => URL.revokeObjectURL(url);
      
      return audio.play();
    })
    .catch(err => {
      console.error("Error reproduciendo audio:", err);
    });
}