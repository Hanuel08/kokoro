import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { PORT, CORS_ORIGIN } from "./config.js";
import { aiRouter } from "./routes/ai.routes.js";
import { ttsRouter } from "./routes/tts.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

app.use(cors({
  origin: CORS_ORIGIN.split(",").map(s => s.trim()),
  methods: ["GET", "POST", "DELETE"],
}));

app.use(morgan("dev"));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const USER_IMG_DIR = path.resolve(__dirname, "../../frontend/public/assets/img/user");
if (!fs.existsSync(USER_IMG_DIR)) {
  fs.mkdirSync(USER_IMG_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, USER_IMG_DIR),
  filename: (_req, _file, cb) => cb(null, "user_profile.jpg"),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post("/upload/profile", upload.single("profile"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Archivo no válido. Usa jpg, png o webp." });
  res.json({ ok: true, path: "/assets/img/user/user_profile.jpg" });
});

app.delete("/upload/profile", (req, res) => {
  const filePath = path.join(USER_IMG_DIR, "user_profile.jpg");
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/chat" || req.path === "/emotion",
});

app.use(globalLimiter);

app.use(aiRouter);
app.use(ttsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
