import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import systemRoutes from "./routes/systemRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api", systemRoutes);
app.use(errorHandler);

export default app;
