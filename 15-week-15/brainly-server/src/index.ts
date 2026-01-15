//// @ts-ignore: Suppresses TypeScript errors on the next line. Use sparingly - only when you're certain the code is correct but TS can't infer it.
//// @ts-nocheck: Disables TypeScript checking for the entire file. Avoid using - defeats the purpose of TypeScript.
// Best practice: Fix the underlying type issues instead of suppressing errors.

import dotenv from "dotenv"; // Load .env file - must be first import
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import linkRouter from "./routes/link.js";
import tagRouter from "./routes/tag.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", authRouter); // signup, signin
app.use("/api/v1/content", contentRouter); // content CRUD
app.use("/api/v1/tags", tagRouter); // tag CRUD
app.use(linkRouter); // /api/v1/brain/share, /api/v1/brain/:shareLink

async function main() {
  await connectDB();
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}

main();
