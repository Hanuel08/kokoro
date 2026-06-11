
export const speakWithSpeech = ({ text, language = "es-ES" }) => {
  if (!'speechSynthesis' in window) return alert("Tu navegador no soporta TTS")
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language
  return window.speechSynthesis.speak(utterance)
}