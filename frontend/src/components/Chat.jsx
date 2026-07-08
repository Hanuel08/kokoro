import { useEffect, useState, useRef } from "react";
import { helpHttp } from "../helpers/helpHttp.js";
import Markdown from "react-markdown";
import { useConfig } from "../context/ConfigContext";

import PROFILE_KOKORO from "/assets/img/model_profile.png";

import { IconArrowNarrowUp } from '@tabler/icons-react';

export function Chat({ onEmotionUpdate }) {
  const { config, modelInfo, getProfileImage } = useConfig();
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  const URL_ANSWERS = `${BASE_URL}/chat`;
  const URL_EMOTION = `${BASE_URL}/emotion`;
  const URL_TTS = `${BASE_URL}/tts`;

  const { post } = helpHttp();

  const characterName = config?.characterName || "Kokoro";
  const userName = config?.userName || "";
  const aiModel = config?.aiModel || "google/gemma-4-31b-it:free";

  const displayName = userName || "Tú";

  const [messages, setMessages] = useState([
    { role: "assistant", content: `¡Hola! Soy ${characterName}. ¿En qué puedo ayudarte hoy?` }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const speakText = async (text) => {
    if (!config?.tts?.enabled) return;
    try {
      const res = await fetch(URL_TTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: config.tts.voice }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch(err) {
      console.error("[TTS] TTS no disponible:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    const optionsAnswers = {
      headers: {
        "Content-Type": "application/json",
        "accept": "text/plain"
      },
      body: {
        prompt: userMsg,
        characterName,
        userName,
        model: aiModel,
        modelId: modelInfo?.id,
      }
    };

    const sendEmotion = (delay = 10000) => {
      setTimeout(() => {
        const optionsEmotion = {
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
          },
          body: {
            prompt: userMsg,
            characterName,
            userName,
            modelId: modelInfo?.id,
          }
        };
        console.log("[Emotion] Enviando petición a:", URL_EMOTION, optionsEmotion);
        post(URL_EMOTION, optionsEmotion)
          .then((data) => {
            console.log("[Emotion] Respuesta recibida:", JSON.stringify(data));
            if (!data || data?.err || !data?.emotion?.current) {
              console.warn("[Emotion] Data inválida:", data);
              return;
            }
            console.log("[Emotion] Actualizando emoción:", data.emotion.current, "intensidad:", data.emotion.intensity);
            onEmotionUpdate(data);
          })
          .catch((err) => {
            console.warn("[Emotion] Error en fetch:", err?.statusText || err?.message || err);
          });
      }, delay);
    };

    console.log("[Chat] Enviando petición a:", URL_ANSWERS, optionsAnswers);
    sendEmotion(2000);
    post(URL_ANSWERS, optionsAnswers)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("[Chat] Respuesta no ok:", res.status, text);
          throw new Error("Error al obtener la respuesta");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantMsg = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantMsg += decoder.decode(value, { stream: true });

          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1].content = assistantMsg;
            return newMsgs;
          });
        }
        setIsTyping(false);
        speakText(assistantMsg);
      })
      .catch(err => {
        console.error("Chat error:", err);
        const msg = err?.statusText
          || (err?.message === "Failed to fetch" ? "No se pudo conectar con el servidor. ¿Estará encendido el backend?" : null)
          || err?.message
          || "Error al conectar con el servidor";
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = `⚠️ *${msg}*`;
          return newMsgs;
        });
        setIsTyping(false);
      });
  };

  const aiProfileImg = getProfileImage(modelInfo?.id);
  const userProfileImg = config?.userProfileUploaded
    ? "/assets/img/user/user_profile.jpg"
    : "/assets/img/user/default_profile.jpg";

  return (
    <div className="flex flex-col w-3xl h-full bg-white dark:bg-dark-base rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden transition-colors 
    duration-300">

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

            <div className="flex gap-3 max-w-[85%] sm:max-w-[75%]">

              <div className={`flex-shrink-0 ${msg.role === "user" ? "order-2" : "order-1"}`}>
                <div className={`w-9 h-9 rounded-full overflow-hidden shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary/10"
                    : "bg-[#CE5374]"
                }`}>
                  {msg.role === "user" ? (
                    <img
                      src={userProfileImg}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = PROFILE_KOKORO;
                      }}
                    />
                  ) : (
                    <img
                      src={aiProfileImg}
                      alt={characterName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = PROFILE_KOKORO;
                      }}
                    />
                  )}
                </div>
              </div>

              <div className={`flex flex-col gap-1 min-w-0 ${msg.role === "user" ? "order-1" : "order-2"}`}>
                <span className={`text-xs font-semibold tracking-wide ${
                  msg.role === "user"
                    ? "text-[#CE5374] text-right"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  {msg.role === "user" ? displayName : characterName}
                </span>

                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-slate-100 dark:bg-dark-elevated text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-dark-border shadow-sm"
                }`}>
                  {msg.content === "" && isTyping && msg.role === "assistant" ? (
                    <div className="flex items-center gap-1 h-6">
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 max-w-none break-words">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-dark-base border-t border-slate-200 dark:border-dark-border">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 max-w-4xl mx-auto bg-slate-50 dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border p-2 
            transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Escribe un mensaje a ${characterName}...`}
            className="w-full max-h-[150px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-800 dark:text-slate-100 
              placeholder-slate-400 dark:placeholder-slate-500 min-h-[44px] overflow-y-auto outline-none"
            rows="1"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 mb-1 mr-1 p-2.5 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-white transition-colors 
              focus:outline-none"
          >
            <IconArrowNarrowUp stroke={2} size={24} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">{characterName} puede cometer errores. Considera verificar la información.</span>
        </div>
      </div>
    </div>
  );
}
