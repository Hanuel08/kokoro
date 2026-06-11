import express from "express";
import cors from "cors";
import morgan from "morgan";

import { PORT } from "./config.js";
import { aiRouter } from "./routes/ai.routes.js";

const app = express();

// 1. Middleware para analizar JSON (ej. axios, fetch, Postman)
app.use(express.json());

// 2. Middleware para analizar datos de formularios HTML
app.use(express.urlencoded({ extended: true }));

app.use(cors());
//app.use(morgan("dev"));

app.use(aiRouter);

// app.use(cors());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});