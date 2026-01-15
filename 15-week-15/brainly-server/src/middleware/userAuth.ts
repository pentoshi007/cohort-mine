import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export interface AuthRequest extends Request {
  userId?: mongoose.Types.ObjectId;
}

export function userAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: mongoose.Types.ObjectId;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
}
