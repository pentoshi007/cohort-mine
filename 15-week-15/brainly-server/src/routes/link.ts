import { Router } from "express";
import { LinkModel } from "../schema/Link.js";
import { userAuth, type AuthRequest } from "../middleware/userAuth.js";
import { generateRandomString } from "../utils/random.js";
import type { Response, Request } from "express";
import { ContentModel } from "../schema/Content.js";
import { Schema } from "mongoose";

const router = Router();

router.post(
  "/api/v1/brain/share",
  userAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const share = req.body.share;
      if (share) {
        const userId = req.userId!;

        const existingLink = await LinkModel.findOne({
          userId: userId as any,
        });
        if (existingLink) {
          await LinkModel.deleteOne({ userId: userId as any });
        }
        const hash = generateRandomString(10);
        await LinkModel.create({ hash: hash, userId: userId as any });
        res.json({ hash: hash, message: "Link created" });
      } else {
        const userId = req.userId!;
        await LinkModel.deleteOne({ userId: userId as any });
        res.json({ message: "Link removed" });
      }
    } catch (error) {
      console.error("Share link error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
  try {
    const shareLink = req.params.shareLink;
    if (!shareLink) {
      res.status(400).json({ message: "Invalid share link" });
      return;
    }
    const link = await LinkModel.findOne({ hash: shareLink }).populate(
      "userId",
      "email"
    );
    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }
    const contents = await ContentModel.find({ userId: link.userId });
    res.json({
      username: (link.userId as any).email,
      contents,
    });
  } catch (error) {
    console.error("Get share link error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
