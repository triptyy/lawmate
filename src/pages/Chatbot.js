// src/pages/Chatbot.js
// Uploaded file reference (for tooling): /mnt/data/Chatbot.js

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/chatbot.css";

export default function Chatbot() {
  const navigate = useNavigate();

  // Chat state
  const [messages, setMessages] = useState([
    { id: 1, role: "bot", text: "Hello — choose a language and speak or type below.", meta: { replyLang: "en-US" } },
  ]);
  
  const [inputText, setInputText] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(true);

  const [isAwaitingReply, setIsAwaitingReply] = useState(false);

  // Language / voice settings
  const [recLang, setRecLang] = useState("en-US"); // "en-US" | "hi-IN" | "auto"
  const [speakLang, setSpeakLang] = useState("en-US"); // "en-US" | "hi-IN"
  const [autoTranslateBeforeSend, setAutoTranslateBeforeSend] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");

  // NEW: mic disabled state
  const [micDisabled, setMicDisabled] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const voicesLoadedRef = useRef(false);
  const userInteractedRef = useRef(false);
  

  // --- Initialize SpeechRecognition (once) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      setIsRecognitionSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Use a safe default here (do not read recLang inside this one-time effect)
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (interim) setInterimTranscript(interim);
      if (final) {
        setFinalTranscript((prev) => (prev ? prev + " " + final : final));
        setInputText((prev) => (prev ? prev + " " + final : final));
      }
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, []); // run once

  // Keep recognition.lang in sync when user changes recLang
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = recLang === "auto" ? "en-US" : recLang;
    }
  }, [recLang]);

  // Scroll messages to bottom on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // --- Voice loading (must happen after a user gesture in some browsers) ---
  const loadVoices = useCallback(() => {
    try {
      const v = window.speechSynthesis.getVoices() || [];
      setVoices(v);
      voicesLoadedRef.current = true;
      // set selectedVoiceURI to first suitable voice if not chosen
      if (!selectedVoiceURI && v.length > 0) {
        const match = v.find((x) => x.lang && x.lang.startsWith(speakLang.split("-")[0]));
        if (match) setSelectedVoiceURI(match.voiceURI);
      }
    } catch (e) {
      console.warn("loadVoices error", e);
    }
  }, [speakLang, selectedVoiceURI]);

  useEffect(() => {
    // onvoiceschanged may fire later
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
    // also try initial load
    loadVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]); // include loadVoices so linter is happy

  const ensureVoicesAvailable = () => {
    userInteractedRef.current = true;
    if (!voicesLoadedRef.current) loadVoices();
  };

  // --- Start/Stop recognition ---
  const toggleListening = () => {
    // do not start/stop if mic is disabled
    if (micDisabled) return;

    ensureVoicesAvailable();
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = recLang === "auto" ? "en-US" : recLang;
        recognitionRef.current.start();
      } catch (e) {
        console.error("recognition start failed", e);
      }
    }
  };

  // --- TTS helper ---
  const speakText = (text, lang = speakLang) => {
    // If micDisabled (user wants no audio), cancel any playing audio and return.
    if (micDisabled) {
      try {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      } catch (e) {}
      return;
    }

    ensureVoicesAvailable();
    if (!("speechSynthesis" in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      if (selectedVoiceURI) {
        const chosen = voices.find((v) => v.voiceURI === selectedVoiceURI);
        if (chosen) utt.voice = chosen;
      } else {
        const match = voices.find((v) => v.lang && v.lang.startsWith(lang.split("-")[0]));
        if (match) utt.voice = match;
      }
      utt.rate = 1;
      utt.pitch = 1;
      window.speechSynthesis.speak(utt);
    } catch (e) {
      console.warn("TTS failed", e);
    }
  };

  // detect if string contains Devanagari characters -> treat as Hindi
  const looksLikeHindi = (s) => /[\u0900-\u097F]/.test(s);

  const buildPayload = async (rawText) => {
    const payload = {
      originalText: rawText,
      sourceLang: recLang === "auto" ? "und" : recLang.split("-")[0], // 'und' = undetermined
      translatedText: null,
      targetLang: "en",
      speakLang,
      metadata: { ts: new Date().toISOString(), client: "web" },
    };

    if (autoTranslateBeforeSend && recLang !== "en-US") {
      // Attempt client-side request to /api/translate — backend should do it for real
      try {
        const r = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText, sourceLang: payload.sourceLang, targetLang: "en" }),
        });
        if (r.ok) {
          const json = await r.json();
          payload.translatedText = json.translatedText || null;
          if (json.detectedSourceLang) payload.sourceLang = json.detectedSourceLang;
        } else {
          // fallback: don't set translatedText
          console.warn("Translate endpoint returned non-OK", r.status);
        }
      } catch (err) {
        console.warn("Translate call failed (client) — will proceed without translatedText", err);
      }
    }

    return payload;
  };

  // --- sendMessage to backend (and fallback to simulated reply if backend missing) ---
  const sendMessage = async () => {
    const raw = inputText.trim();
    if (!raw) return;

    // push user message
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", text: raw, meta: { lang: recLang } }]);
    setInputText("");
    setFinalTranscript("");

    // push placeholder bot message
    const loadingId = `loading-${Date.now()}`;
    setMessages((m) => [...m, { id: loadingId, role: "bot", text: "Thinking..." }]);
    setIsAwaitingReply(true);

    const payload = await buildPayload(raw);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // show helpful server error
        const txt = await res.text();
        throw new Error(`server error ${res.status}: ${txt}`);
      }

      const json = await res.json();
      // prefer translatedReply then reply
      const replyText = json.translatedReply || json.reply || "No reply returned";
      const replyLang = json.replyLang || (looksLikeHindi(replyText) ? "hi-IN" : "en-US");

      // replace loading placeholder with actual reply
      setMessages((m) => m.map((msg) => (msg.id === loadingId ? { id: `b-${Date.now()}`, role: "bot", text: replyText, meta: { replyLang } } : msg)));
      setIsAwaitingReply(false);

      // speak reply in replyLang or speakLang preference
      speakText(replyText, replyLang);
    } catch (err) {
      console.error("chat call failed:", err);

      // fallback behavior: create a simulated reply (echo) so UI continues working
      const fallbackReply = looksLikeHindi(raw) ? `आपने कहा: ${raw}` : `You said: ${raw}`;
      const fallbackReplyLang = looksLikeHindi(raw) ? "hi-IN" : "en-US";

      setMessages((m) => m.map((msg) => (msg.id === loadingId ? { id: `b-${Date.now()}`, role: "bot", text: `⚠️ Backend error — using local fallback.\n\n${fallbackReply}`, meta: { replyLang: fallbackReplyLang } } : msg)));
      setIsAwaitingReply(false);

      // speak fallback in selected language
      speakText(fallbackReply, fallbackReplyLang);
    }
  };

  // Insert last final transcript or start mic
  const insertOrToggleMic = () => {
    ensureVoicesAvailable();
    if (finalTranscript) {
      setInputText((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
    } else {
      toggleListening();
    }
  };

  // copy / download test payload for dev
  const copyTestPayload = async () => {
    const text = inputText.trim() || finalTranscript || "";
    if (!text) {
      alert("Type or speak a message to build a test payload.");
      return;
    }
    const p = await buildPayload(text);
    await navigator.clipboard.writeText(JSON.stringify(p, null, 2));
    alert("Payload copied to clipboard");
  };

  const downloadTestPayload = async () => {
    const text = inputText.trim() || finalTranscript || "";
    if (!text) {
      alert("Type or speak a message to build a test payload.");
      return;
    }
    const p = await buildPayload(text);
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat_payload_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // play (speak) a particular message
  const playMessage = (msg) => {
    // if micDisabled, ensure audio is stopped and do not play
    if (micDisabled) {
      try {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      } catch (e) {}
      return;
    }
    const lang = msg.meta?.replyLang || (looksLikeHindi(msg.text) ? "hi-IN" : "en-US");
    speakText(msg.text, lang);
  };

  // helper: Shift+Enter new line; Enter send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-page" onClick={ensureVoicesAvailable}>
      <div className="chat-card">
        <header className="chat-header">
          <div>
            <h1>👨🏼‍⚖👩🏼‍⚖ LAWBOT</h1>
            <p className="muted">Pick recognition/TTS language. If backend missing you will get a local fallback reply.</p>
            {!isRecognitionSupported && (
              <div style={{ color: "crimson", marginTop: 6, fontWeight: 700 }}>
                Speech Recognition not supported by this browser.
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="btn back" onClick={() => navigate("/desktop")}>⬅ Back</button>
            <button className="btn" onClick={() => { /* optional global speak-all */ voicesLoadedRef.current && window.speechSynthesis.cancel(); }}>🔊</button>
            {/* NEW: mic disable/enable button */}
            <button
              className="btn"
              onClick={() => {
                // toggle micDisabled and if disabling, cancel any ongoing TTS immediately
                setMicDisabled((prev) => {
                  const next = !prev;
                  if (next) {
                    try {
                      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                    } catch (e) {}
                  }
                  return next;
                });
              }}
              title={micDisabled ? "Enable microphone & audio" : "Disable microphone & audio"}
            >
              {micDisabled ? "Enable Mic" : "Disable Mic"}
            </button>
          </div>
        </header>

        <section className="settings-row">
          <div className="setting">
            <label>Recognition Language</label>
            <select value={recLang} onChange={(e) => setRecLang(e.target.value)}>
              <option value="en-US">English (en-US)</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
              <option value="auto">Auto-detect (send raw transcript)</option>
            </select>
          </div>

          <div className="setting">
            <label>TTS Language</label>
            <select value={speakLang} onChange={(e) => setSpeakLang(e.target.value)}>
              <option value="en-US">English (en-US)</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
            </select>
          </div>

          <div className="setting">
            <label>Voice (optional)</label>
            <select value={selectedVoiceURI} onChange={(e) => setSelectedVoiceURI(e.target.value)}>
              <option value="">(default)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} — {v.lang}
                </option>
              ))}
            </select>
          </div>

          <div className="setting">
            <label className="checkbox">
              <input type="checkbox" checked={autoTranslateBeforeSend} onChange={(e) => setAutoTranslateBeforeSend(e.target.checked)} />
              Translate to English before sending
            </label>
          </div>
        </section>

        <main className="chat-main">
          <div className="messages">
            {messages.map((m) => (
              <div key={m.id} className={`message ${m.role === "user" ? "user" : "bot"}`}>
                <div className="avatar">{m.role === "user" ? "🙂" : "🤖"}</div>
                <div className="bubble">
                  <div className="msg-text">{m.text}</div>
                  <div className="msg-row">
                    <span className="badge">{m.meta?.replyLang || (m.role === "user" ? (recLang === "auto" ? "auto" : recLang.split("-")[0]) : speakLang)}</span>
                    {m.role === "bot" && (
                      <div className="msg-actions">
                        <button className="icon-btn" title="Play" onClick={() => playMessage(m)}>🔊</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            <div className="left-col">
              <button className={`mic-btn ${isListening ? "listening" : ""}`} onClick={toggleListening} disabled={micDisabled}>
                {isListening ? "● Recording" : "🎤 Speak"}
              </button>
              <div className="mic-preview">{isListening ? <em>{interimTranscript || "Listening..."}</em> : <span className="muted">{finalTranscript ? `Last: ${short(finalTranscript, 40)}` : "Tap to speak"}</span>}</div>
            </div>

            <div className="right-col">
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type or paste text here..." rows={2} />
              <div className="composer-actions">
                <button className="btn" onClick={sendMessage} disabled={isAwaitingReply}>{isAwaitingReply ? "Waiting..." : "Send"}</button>
                <button className="btn alt" onClick={insertOrToggleMic}>⤓ Insert Speech</button>
                <button className="btn outline" onClick={copyTestPayload}>Copy Payload</button>
                <button className="btn outline" onClick={downloadTestPayload}>Download</button>
              </div>
            </div>
          </div>
        </main>

        <footer className="muted small">Note: For correct translation you must wire your backend endpoints. Local fallback will echo your message if backend unavailable.</footer>
      </div>
    </div>
  );
}

// simple helper used in JSX (kept after export for eslint)
function short(s, n = 36) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}
