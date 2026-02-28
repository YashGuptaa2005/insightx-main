import { useState, useRef, useEffect } from "react"
import axios from "axios"

const SUGGESTED = [
  "What are the top reasons for transaction failures during peak hours?",
  "Which age group has the highest success rate for P2M transactions above ₹5,000?",
  "How do transaction volumes vary across states on weekends?",
  "What are the fraud flag patterns across different device types?",
]

function Message({ message }) {
  const isUser = message.role === "user"
  return (
    <div style={{
      display: "flex",
      gap: "12px",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "20px",
    }}>
      {!isUser && (
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #00d4a0, #00a878)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: "2px",
          boxShadow: "0 0 12px rgba(0,212,160,0.2)",
          fontSize: "13px"
        }}>⚡</div>
      )}
      <div style={{
        maxWidth: "72%",
        padding: "12px 16px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "var(--bg-card)" : "var(--bg-secondary)",
        border: `1px solid ${isUser ? "var(--border-hover)" : "var(--border)"}`,
        fontSize: "13px",
        lineHeight: "1.7",
        color: "var(--text-primary)",
        whiteSpace: "pre-wrap",
        boxShadow: isUser ? "none" : "0 2px 12px rgba(0,0,0,0.3)"
      }}>
        {!isUser && (
          <div style={{
            fontSize: "10px",
            color: "var(--accent)",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}>InsightX</div>
        )}
        {message.content}
      </div>
      {isUser && (
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "8px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-hover)",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          flexShrink: 0, marginTop: "2px",
          fontSize: "13px"
        }}>👤</div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      display: "flex", gap: "12px",
      justifyContent: "flex-start",
      marginBottom: "20px"
    }}>
      <div style={{
        width: "30px", height: "30px",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #00d4a0, #00a878)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 0 12px rgba(0,212,160,0.2)",
        fontSize: "13px"
      }}>⚡</div>
      <div style={{
        padding: "12px 16px",
        borderRadius: "16px 16px 16px 4px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "4px"
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "var(--accent)",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  )
}

export default function ChatInterface({ messages, setMessages, sessionId }) {
  // const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  // const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async (question) => {
    const text = question || input.trim()
    if (!text || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: text }])
    setLoading(true)
    try {
      const res = await axios.post("https://insightx-5j67.onrender.com/api/ask", {
        question: text,
        session_id: sessionId
      })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Could not connect to backend. Make sure the server is running on port 8000."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", background: "var(--bg-primary)"
    }}>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "24px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ width: "100%", maxWidth: "680px" }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              minHeight: "60vh", gap: "28px",
              textAlign: "center"
            }}>
              <div>
                <div style={{
                  width: "52px", height: "52px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #00d4a0, #00a878)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 0 32px rgba(0,212,160,0.3)",
                  fontSize: "24px"
                }}>⚡</div>
                <h2 style={{
                  fontSize: "22px", fontWeight: "600",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.5px", marginBottom: "8px"
                }}>What would you like to know?</h2>
                <p style={{
                  fontSize: "13px", color: "var(--text-secondary)",
                  lineHeight: "1.6"
                }}>
                  Ask anything about your 250K UPI transactions
                </p>
              </div>

              {/* Suggested questions */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "10px",
                width: "100%"
              }}>
                {SUGGESTED.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--accent)"
                      e.currentTarget.style.color = "var(--text-primary)"
                      e.currentTarget.style.background = "var(--accent-dim)"
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--border)"
                      e.currentTarget.style.color = "var(--text-secondary)"
                      e.currentTarget.style.background = "var(--bg-secondary)"
                    }}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      lineHeight: "1.6",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{
                      display: "block", fontSize: "9px",
                      color: "var(--accent)",
                      fontFamily: "'JetBrains Mono', monospace",
                      marginBottom: "5px", letterSpacing: "0.8px",
                      textTransform: "uppercase"
                    }}>Suggested</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <Message key={i} message={msg} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        flexShrink: 0,
        padding: "12px 24px 20px",
        borderTop: "1px solid var(--border)",
        background: "rgba(12,12,14,0.97)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div style={{ width: "100%", maxWidth: "900px", padding: "0 12px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-hover)",
            borderRadius: "16px",
            padding: "8px 8px 8px 18px",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask a leadership question about your UPI data..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                padding: "4px 0"
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: "36px", height: "36px",
                borderRadius: "10px",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #00d4a0, #00a878)"
                  : "var(--bg-card)",
                color: input.trim() && !loading ? "#000" : "var(--text-dim)",
                fontSize: "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
                boxShadow: input.trim() && !loading
                  ? "0 0 14px rgba(0,212,160,0.4)" : "none",
                flexShrink: 0
              }}
            >↑</button>
          </div>
          <p style={{
            textAlign: "center", fontSize: "11px",
            color: "var(--text-dim)", marginTop: "10px",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.3px"
          }}>
            InsightX · 250,000 UPI transactions · Jan–Dec 2024
          </p>
        </div>
      </div>

    </div>
  )
}