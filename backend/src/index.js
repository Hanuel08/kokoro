import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { PORT, CORS_ORIGIN } from "./config.js";
import { aiRouter } from "./routes/ai.routes.js";
import { ttsRouter } from "./routes/tts.routes.js";

const app = express();

app.use(helmet());

app.use(cors({
  origin: CORS_ORIGIN.split(",").map(s => s.trim()),
  methods: ["GET", "POST"],
}));

app.use(morgan("dev"));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(aiRouter);
app.use(ttsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
