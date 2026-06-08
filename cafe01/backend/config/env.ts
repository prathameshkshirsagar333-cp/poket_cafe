import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || process.env.NEXTAUTH_URL || "http://localhost:3000",
};
