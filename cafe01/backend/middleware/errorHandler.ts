import type { NextFunction, Request, Response } from "express";

export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled server error:", err);
  res.status(err?.status || 500).json({
    success: false,
    error: err?.message || "Internal Server Error",
  });
}
