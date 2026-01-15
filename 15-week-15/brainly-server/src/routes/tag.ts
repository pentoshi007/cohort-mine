import { Router } from "express";
import type { Response } from "express";
import { TagModel } from "../schema/Tag.js";
import { userAuth, type AuthRequest } from "../middleware/userAuth.js";

const router = Router();

// Get all tags for logged-in user
router.get("/", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const tags = await TagModel.find({ userId }).sort({ title: 1 });
    res.json({ tags });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new tag
router.post("/", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!title) {
      res.status(400).json({ message: "Tag title is required" });
      return;
    }

    // Check if tag already exists
    const existingTag = await TagModel.findOne({
      title: title.toLowerCase(),
      userId,
    });

    if (existingTag) {
      res.json({ tag: existingTag, message: "Tag already exists" });
      return;
    }

    const tag = await TagModel.create({
      title: title.toLowerCase(),
      userId,
    });

    res.status(201).json({ tag, message: "Tag created" });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a tag
router.delete("/:id", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const tag = await TagModel.findOneAndDelete({
      _id: id,
      userId: userId as any,
    });

    if (!tag) {
      res.status(404).json({ message: "Tag not found" });
      return;
    }

    res.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
