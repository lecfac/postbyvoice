import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { initDb, getDb } from "./db.js";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get all drafts
app.get("/api/drafts", async (req, res) => {
  try {
    const db = getDb();
    const drafts = await db.all(`
      SELECT d.*, n.title as newsTitle
      FROM drafts d
      LEFT JOIN news n ON d.newsId = n.id
      ORDER BY d.createdAt DESC
    `);
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single draft
app.get("/api/drafts/:id", async (req, res) => {
  try {
    const db = getDb();
    const draft = await db.get(
      `SELECT d.*, n.title as newsTitle
       FROM drafts d
       LEFT JOIN news n ON d.newsId = n.id
       WHERE d.id = ?`,
      req.params.id
    );
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create drafts from content
app.post("/api/generate", async (req, res) => {
  try {
    const { userInput, newsId } = req.body;
    if (!userInput) {
      return res.status(400).json({ error: "userInput is required" });
    }

    const systemPrompt = `You are a content strategist specializing in pavement engineering, civil infrastructure, and AI integration for engineering/consulting firms. Create compelling, platform-appropriate content variants.

Your task is to:
1. Identify the core message/hook
2. Create LinkedIn version (professional, value-focused, 2-3 sentences)
3. Create Twitter/X version (snappy, trending-aware, <280 chars)
4. Create Substack version (detailed, educational, 150-200 words)

Format your response as JSON:
{
  "coreMessage": "The main idea in 1 sentence",
  "linkedIn": "LinkedIn version",
  "twitter": "Twitter version",
  "substack": "Substack version"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Create content variants from this: "${userInput}"`,
        },
      ],
      system: systemPrompt,
    });

    const content = message.content[0].text;
    const parsed = JSON.parse(content);

    const db = getDb();
    const result = await db.run(
      `INSERT INTO drafts (coreMessage, linkedIn, twitter, substack, newsId)
       VALUES (?, ?, ?, ?, ?)`,
      [
        parsed.coreMessage,
        parsed.linkedIn,
        parsed.twitter,
        parsed.substack,
        newsId || null,
      ]
    );

    res.json({
      id: result.lastID,
      ...parsed,
      newsId: newsId || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload and process file
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    let content = req.file.buffer.toString("utf-8");
    const fileName = req.file.originalname;

    // If file is large, truncate
    if (content.length > 5000) {
      content = content.substring(0, 5000) + "...";
    }

    const systemPrompt = `Extract the key ideas and main message from this content.
Be concise and focus on actionable insights.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Process this file content:\n\n${content}`,
        },
      ],
      system: systemPrompt,
    });

    const extracted = message.content[0].text;

    res.json({
      fileName,
      extracted,
      content: content.substring(0, 1000) + "...",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update draft
app.patch("/api/drafts/:id", async (req, res) => {
  try {
    const db = getDb();
    const { coreMessage, linkedIn, twitter, substack } = req.body;

    await db.run(
      `UPDATE drafts
       SET coreMessage = ?, linkedIn = ?, twitter = ?, substack = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [coreMessage, linkedIn, twitter, substack, req.params.id]
    );

    const draft = await db.get("SELECT * FROM drafts WHERE id = ?", req.params.id);
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete draft
app.delete("/api/drafts/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.run("DELETE FROM drafts WHERE id = ?", req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all news items
app.get("/api/news", async (req, res) => {
  try {
    const db = getDb();
    const news = await db.all(
      "SELECT * FROM news ORDER BY createdAt DESC"
    );
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add news item
app.post("/api/news", async (req, res) => {
  try {
    const { title, content, source } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const db = getDb();
    const result = await db.run(
      `INSERT INTO news (title, content, source)
       VALUES (?, ?, ?)`,
      [title, content, source || "Manual"]
    );

    // Generate suggestions
    const systemPrompt = `Based on this AI/pavement engineering news, suggest 3 different content angles for social media and newsletter. Keep each suggestion concise (1-2 sentences).`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `News: ${title}\n\nDetails: ${content}`,
        },
      ],
      system: systemPrompt,
    });

    const suggestionsText = message.content[0].text;
    const suggestions = suggestionsText
      .split("\n")
      .filter((s) => s.trim())
      .slice(0, 3);

    for (const suggestion of suggestions) {
      await db.run(
        `INSERT INTO suggestions (newsId, suggestion)
         VALUES (?, ?)`,
        [result.lastID, suggestion]
      );
    }

    res.json({
      id: result.lastID,
      title,
      content,
      source,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news with suggestions
app.get("/api/news/:id", async (req, res) => {
  try {
    const db = getDb();
    const news = await db.get("SELECT * FROM news WHERE id = ?", req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    const suggestions = await db.all(
      "SELECT * FROM suggestions WHERE newsId = ?",
      req.params.id
    );

    res.json({ ...news, suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete news
app.delete("/api/news/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.run("DELETE FROM news WHERE id = ?", req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
