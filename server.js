
const express = require("express");
const app = express();
app.use(express.json());


app.post("/api/translate", (req, res) => {
  const { text = "", sourceLang = "und", targetLang = "en" } = req.body || {};

  const isHindi = /[\u0900-\u097F]/.test(text);
  if (isHindi && targetLang && targetLang.startsWith("en")) {
  
    return res.json({ translatedText: `[mock-EN] ${text}`, detectedSourceLang: "hi" });
  }

  return res.json({ translatedText: text, detectedSourceLang: sourceLang });
});

// POST /api/chat
app.post("/api/chat", (req, res) => {
  const { originalText, translatedText, sourceLang, speakLang } = req.body || {};
  const textForAgent = translatedText || originalText || "";
  const reply = `Agent reply (server stub): processed -> ${textForAgent}`;
  // determine reply language using Devanagari range
  const replyLang = /[\u0900-\u097F]/.test(reply) ? "hi-IN" : "en-US";
  return res.json({ reply, replyLang, translatedReply: null });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Demo API server listening on http://localhost:${PORT}`));
