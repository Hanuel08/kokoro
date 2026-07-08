# Kokoro

Una aplicación de chat con asistentes virtuales 3D que utilizan modelos Live2D para ofrecer una experiencia de conversación interactiva, emocional y con voz.

## Capturas de pantalla

<!-- Agrega aquí tus imágenes -->
<!-- ![Vista principal](screenshots/main.png) -->

## Características

- **Chat con IA** — Conversaciones fluidas con streaming de respuestas usando modelos de OpenRouter
- **Avatares Live2D** — Personajes 3D que reaccionan emocionalmente a la conversación en tiempo real
- **Detección de emociones** — La IA analiza el contexto y expresa 11 emociones (feliz, triste, enojada, sorprendida, emocionada, miedo, amor, odio, asco, pensativa, neutral). Usa HuggingFace por defecto con OpenRouter como respaldo
- **Múltiples personajes** — 9 modelos Live2D disponibles: Hiyori, Haru, Hibiki, Mao, Miku, Natori, Rice, Wanko y Mark
- **Personalidades adaptativas** — Cada personaje tiene una personalidad distinta según su modelo (chica dulce, chico amigable, perro juguetón, etc.)
- **Texto a voz (TTS)** — Reproduce en voz alta las respuestas del personaje usando Unreal Speech v8. Voz configurable con más de 50 voces en múltiples idiomas
- **Configuración de voz** — Activa/desactiva el TTS y elige la voz del personaje (Americana, China, Española, Francesa, Hindi, Italiana, Portuguesa)
- **Tema claro/oscuro** — Alterna entre modo claro y oscuro
- **Subir foto de perfil** — El usuario puede subir su propia foto de perfil
- **Configuración flexible** — Elige modelo de IA, nombre del personaje, imagen de perfil personalizada por modelo y más

## Tecnologías

### Frontend
- **React 19** — UI
- **Vite** — Bundler y entorno de desarrollo
- **Tailwind CSS v4** — Estilos
- **Pixi.js 6** — Renderizado 3D
- **pixi-live2d-display** — Integración de modelos Live2D Cubism 4
- **@tabler/icons-react** — Iconos
- **react-markdown** — Renderizado de respuestas Markdown

### Backend
- **Express.js 5** — Servidor HTTP
- **@openrouter/sdk** — SDK oficial de OpenRouter para acceso a modelos de IA
- **@huggingface/inference** — Inferencia de emociones multilingüe (respaldo: OpenRouter)
- **Unreal Speech v8 API** — Texto a voz con 50+ voces, streaming en 300ms
- **Multer** — Manejo de subida de archivos
- **Helmet** — Seguridad HTTP
- **express-rate-limit** — Límite de peticiones (60/min rutas AI, global separado)
- **Morgan** — Logs de peticiones

## Requisitos

- Node.js 18+
- Una clave API de OpenRouter (gratuita en https://openrouter.ai/keys)
- (Opcional) Un token de HuggingFace para detección de emociones (https://huggingface.co/settings/tokens)
- (Opcional) Una clave API de Unreal Speech para texto a voz (https://unrealspeech.com)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd kokoro
   ```

2. Instala las dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Configura las variables de entorno en `backend/.env`:
   ```env
   KOKORO_ANSWERS_API_KEY=sk-or-v1-tu-api-key
   KOKORO_EMOTIONS_API_KEY=sk-or-v1-tu-api-key
   MODEL_AI_ANSWERS=google/gemma-4-31b-it:free
   MODEL_AI_EMOTIONS=meta-llama/llama-3.3-70b-instruct:free

   # Opcional — detección de emociones con HuggingFace (más rápido, sin rate limits)
   # HF_TOKEN=hf_tu-token-aqui

   # Opcional — texto a voz con Unreal Speech
   # UNREAL_API_KEY=tu-api-key-aqui
   ```

4. Instala las dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

## Uso

1. Inicia el backend:
   ```bash
   cd backend
   npm run dev
   ```

2. En otra terminal, inicia el frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Abre `http://localhost:5173` en tu navegador.

4. En la primera visita, configura el personaje y el modelo de IA. Luego comienza a chatear.

## Estructura del proyecto

```
kokoro/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── ai.routes.js      # Endpoints /chat y /emotion (con HuggingFace + OpenRouter)
│   │   │   └── tts.routes.js     # Endpoint /tts (texto a voz con Unreal Speech v8)
│   │   ├── config.js             # Variables de entorno
│   │   └── index.js              # Servidor Express (con rate limiters)
│   └── .env                      # API keys y configuración
├── frontend/
│   ├── public/
│   │   ├── assets/img/
│   │   │   ├── profiles/         # Imágenes de perfil por modelo
│   │   │   ├── user/             # Foto de perfil del usuario
│   │   │   └── model_profile.png # Imagen de respaldo
│   │   ├── live2d/               # Cubism Core runtime
│   │   └── models/               # Modelos Live2D (.model3.json)
│   └── src/
│       ├── components/
│       │   ├── Avatar.jsx        # Contenedor del modelo Live2D
│       │   ├── Chat.jsx          # Ventana de chat con streaming y TTS
│       │   ├── EmotionIndicator.jsx # Panel de emociones (11 estados)
│       │   └── Header.jsx        # Barra superior
│       ├── context/
│       │   ├── ConfigContext.jsx  # Estado de configuración (incluye TTS)
│       │   └── ThemeContext.jsx   # Tema claro/oscuro
│       ├── pages/
│       │   ├── Config.jsx        # Página de configuración (modelo, voz, personaje)
│       │   └── Main.jsx          # Layout principal
│       ├── services/
│       │   ├── avatarManager.js  # Gestión del modelo Live2D
│       │   ├── avatarController.js # Control de animaciones y expresiones faciales
│       │   └── emotionManager.js  # Mapeo de 11 emociones a parámetros Live2D
│       └── helpers/
│           ├── helpHttp.js       # Cliente HTTP
│           └── modelImages.js    # URLs de imágenes por defecto
└── README.md
```

## Detección de emociones

El sistema usa dos fuentes para detectar emociones:

1. **HuggingFace** (por defecto) — Usa el modelo `tabularisai/multilingual-emotion-classification` que soporta 23 idiomas y 11 emociones. Solo necesita `HF_TOKEN` en `.env`.
2. **OpenRouter** (respaldo) — Si no hay `HF_TOKEN` o HuggingFace falla, se usa OpenRouter con el modelo configurado en `MODEL_AI_EMOTIONS`.

Las 11 emociones detectadas se mapean a expresiones faciales del modelo Live2D: `happy`, `sad`, `angry`, `surprised`, `excited`, `fear`, `love`, `hate`, `disgust`, `thinking`, `neutral`.

## Voces disponibles (TTS)

El texto a voz usa **Unreal Speech v8** con más de 50 voces. Puedes activar/desactivar el TTS y elegir la voz desde la configuración:

| Idioma | Género | Voces |
|---|---|---|
| American | Female | Autumn, Melody, Hannah, Emily, Ivy, Kaitlyn, Luna, Willow, Lauren, Sierra |
| American | Male | Noah, Jasper, Caleb, Ronan, Ethan, Daniel, Zane |
| Chinese | Female | Mei, Lian, Ting, Jing |
| Chinese | Male | Wei, Jian, Hao, Sheng |
| Spanish | Female | Lucía (por defecto) |
| Spanish | Male | Mateo, Javier |
| French | Female | Élodie |
| Hindi | Female | Ananya, Priya |
| Hindi | Male | Arjun, Rohan |
| Italian | Female | Giulia |
| Italian | Male | Luca |
| Portuguese | Female | Camila |
| Portuguese | Male | Thiago, Rafael |

## Configuración de modelos de IA

La aplicación usa OpenRouter para acceder a modelos de lenguaje. Puedes elegir entre modelos gratuitos preconfigurados o usar cualquier modelo compatible con OpenRouter:

- `google/gemma-4-31b-it:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `qwen/qwen3-coder:free`
- `nvidia/nemotron-3-super-120b-a12b:free`
- `nousresearch/hermes-3-llama-3.1-405b:free`
- Cualquier modelo personalizado de OpenRouter

## Licencia

ISC
