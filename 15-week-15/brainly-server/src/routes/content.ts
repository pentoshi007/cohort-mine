import { Router } from "express";
import type { Response } from "express";
import mongoose from "mongoose";
import { ContentModel } from "../schema/Content.js";
import { TagModel } from "../schema/Tag.js";
import { userAuth, type AuthRequest } from "../middleware/userAuth.js";

const router = Router();

// Create content
router.post("/", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, type = "link", link, content, tags } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    // Validate based on type
    if (type === "note" && !content) {
      res.status(400).json({ message: "Content is required for notes" });
      return;
    }
    if (type !== "note" && !link) {
      res.status(400).json({ message: "Link is required" });
      return;
    }

    // Handle tags - create if they don't exist, get IDs
    let tagIds: mongoose.Types.ObjectId[] = [];
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagTitle of tags) {
        // Find or create tag
        let tag = await TagModel.findOne({ title: tagTitle.toLowerCase(), userId });
        if (!tag) {
          tag = await TagModel.create({ title: tagTitle.toLowerCase(), userId });
        }
        tagIds.push(tag._id as mongoose.Types.ObjectId);
      }
    }

    const newContent = await ContentModel.create({
      title,
      type,
      link: type !== "note" ? link : undefined,
      content: type === "note" ? content : undefined,
      tags: tagIds,
      userId,
    });

    // Populate tags before returning
    const populatedContent = await ContentModel.findById(newContent._id)
      .populate("userId", "email")
      .populate("tags");

    res.status(201).json({ message: "Content created", content: populatedContent });
  } catch (error) {
    console.error("Create content error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all content for logged-in user
router.get("/", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Build filter with optional type
    const typeParam = req.query.type as string | undefined;
    let filter: Record<string, any> = { userId };
    
    if (typeParam && ["note", "video", "tweet", "link"].includes(typeParam)) {
      // Create filter that matches both explicit type AND legacy content by URL pattern
      if (typeParam === "video") {
        filter = {
          userId,
          $or: [
            { type: "video" },
            { type: { $exists: false }, link: { $regex: /youtube\.com|youtu\.be/i } },
            { type: null, link: { $regex: /youtube\.com|youtu\.be/i } },
          ],
        };
      } else if (typeParam === "tweet") {
        filter = {
          userId,
          $or: [
            { type: "tweet" },
            { type: { $exists: false }, link: { $regex: /twitter\.com|x\.com/i } },
            { type: null, link: { $regex: /twitter\.com|x\.com/i } },
          ],
        };
      } else if (typeParam === "link") {
        // Links are anything without a specific type that's not video/tweet
        filter = {
          userId,
          $or: [
            { type: "link" },
            {
              type: { $exists: false },
              link: { $not: { $regex: /youtube\.com|youtu\.be|twitter\.com|x\.com/i } },
            },
            {
              type: null,
              link: { $not: { $regex: /youtube\.com|youtu\.be|twitter\.com|x\.com/i } },
            },
          ],
        };
      } else {
        // note type - must have explicit type set
        filter.type = typeParam;
      }
    }

    const content = await ContentModel.find(filter)
      .populate("userId", "email")
      .populate("tags")
      .sort({ createdAt: -1 });

    res.json({ content });
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete content
router.delete("/:id", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!id) {
      res.status(400).json({ message: "Content ID is required" });
      return;
    }

    const content = await ContentModel.findOneAndDelete({
      _id: id,
      userId: userId as any,
    });

    if (!content) {
      res.status(404).json({ message: "Content not found" });
      return;
    }

    res.json({ message: "Content deleted" });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
