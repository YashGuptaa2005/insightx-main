import { useState, useEffect } from "react"
import Header from "./components/Header"
import ChatInterface from "./components/ChatInterface"
import SummaryCards from "./components/SummaryCards"

export default function App() {
  const [activeTab, setActiveTab] = useState("chat")
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("insightx_session")
    if (saved) return saved
    const newId = Math.random().toString(36).slice(2)
    localStorage.setItem("insightx_session", newId)
    return newId
  })
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("insightx_messages")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("insightx_messages", JSON.stringify(messages))
  }, [messages])

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("insightx_messages")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onClearChat={clearChat} />
      <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", inset: 0,
          display: activeTab === "chat" ? "flex" : "none",
          flexDirection: "column"
        }}>
          <ChatInterface
            messages={messages}
            setMessages={setMessages}
            sessionId={sessionId}
          />
        </div>
        <div style={{
          position: "absolute", inset: 0,
          display: activeTab === "dashboard" ? "block" : "none",
          overflowY: "auto"
        }}>
          <SummaryCards />
        </div>
      </main>
    </div>
  )
}