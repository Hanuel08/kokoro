import { useEffect, useState, useRef } from "react";
import { helpHttp } from "../helpers/helpHttp.js";
import Markdown from "react-markdown";

export function Chat() {
  const URL = "http://localhost:4000/chat";
  const { post } = helpHttp();

  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy Kokoro. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

    const options = {
      headers: {
        "Content-Type": "application/json",
        "accept": "text/plain"
      },
      body: { prompt: userMsg }
    };

    post(URL, options)
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al obtener la respuesta");

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
      })
      .catch(err => {
        console.error("Error", err);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = "⚠️ *Hubo un error al conectar con el servidor.*";
          return newMsgs;
        });
        setIsTyping(false);
      });
  };

  return (
    <div className="flex flex-col w-3xl h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>

              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === "user"
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"
                  : "bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white"
              }`}>
                {msg.role === "user" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <span className="font-bold text-xs">K</span>
                )}
              </div>

              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700"
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
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 p-2 focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje a Kokoro..."
            className="w-full max-h-[150px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-slate-800 dark:text-slate-100 
              placeholder-slate-400 dark:placeholder-slate-500 min-h-[44px] overflow-y-auto outline-none"
            rows="1"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 mb-1 mr-1 p-2.5 rounded-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <svg className="w-5 h-5 translate-x-px -translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">Kokoro puede cometer errores. Considera verificar la información.</span>
        </div>
      </div>
    </div>
  );
}
