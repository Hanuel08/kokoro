# Kokoro

Una aplicación de chat con asistentes virtuales 3D que utilizan modelos Live2D para ofrecer una experiencia de conversación interactiva y con expresiones emocionales.

## Capturas de pantalla

<!-- Agrega aquí tus imágenes -->
<!-- ![Vista principal](screenshots/main.png) -->

## Características

- **Chat con IA** — Conversaciones fluidas con streaming de respuestas usando modelos de OpenRouter
- **Avatares Live2D** — Personajes 3D que reaccionan emocionalmente a la conversación
- **Detección de emociones** — La IA analiza el contexto y expresa emociones (feliz, triste, enojada, etc.)
- **Múltiples personajes** — 9 modelos Live2D disponibles: Hiyori, Haru, Hibiki, Mao, Miku, Natori, Rice, Wanko y Mark
- **Personalidades adaptativas** — Cada personaje tiene una personalidad distinta según su modelo (chica dulce, chico amigable, perro juguetón)
- **Tema claro/oscuro** — Alterna entre modo claro y oscuro
- **Subir foto de perfil** — El usuario puede subir su propia foto de perfil
- **Texto a voz** — Reproduce en voz alta las respuestas del personaje
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
- **Multer** — Manejo de subida de archivos
- **Helmet** — Seguridad HTTP
- **express-rate-limit** — Límite de peticiones
- **Morgan** — Logs de peticiones

## Requisitos

- Node.js 18+
- Una clave API de OpenRouter (gratuita en https://openrouter.ai/keys)

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
│   │   │   ├── ai.routes.js      # Endpoints /chat y /emotion
│   │   │   └── tts.routes.js     # Endpoint /tts (texto a voz)
│   │   ├── config.js             # Variables de entorno
│   │   └── index.js              # Servidor Express
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
│       │   ├── Chat.jsx          # Ventana de chat
│       │   ├── EmotionIndicator.jsx # Panel de emociones
│       │   └── Header.jsx        # Barra superior
│       ├── context/
│       │   ├── ConfigContext.jsx  # Estado de configuración
│       │   └── ThemeContext.jsx   # Tema claro/oscuro
│       ├── pages/
│       │   ├── Config.jsx        # Página de configuración
│       │   └── Main.jsx          # Layout principal
│       ├── services/
│       │   ├── avatarManager.js  # Gestión del modelo Live2D
│       │   ├── avatarController.js # Control de animaciones
│       │   └── emotionManager.js  # Gestión de emociones
│       └── helpers/
│           ├── helpHttp.js       # Cliente HTTP
│           └── modelImages.js    # URLs de imágenes por defecto
└── README.md
```

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
