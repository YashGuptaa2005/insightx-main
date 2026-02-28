export default function Header({ activeTab, setActiveTab, onClearChat }) {
  return (
    <header className="header-root" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: "56px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(12,12,14,0.95)",
      backdropFilter: "blur(12px)",
      flexShrink: 0,
      position: "relative",
      zIndex: 10
    }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #00d4a0, #00a878)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(0,212,160,0.3)"
        }}>
          <span style={{ fontSize: "14px" }}>⚡</span>
        </div>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: "500",
            fontSize: "14px",
            color: "var(--text-primary)",
            letterSpacing: "-0.3px"
          }}>InsightX</div>
          <div className="header-logo-subtitle" style={{
            fontSize: "9px",
            color: "var(--text-secondary)",
            letterSpacing: "0.8px",
            textTransform: "uppercase"
          }}>Analytics Intelligence</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "3px",
        gap: "2px"
      }}>
        {[
          { id: "chat", label: "Chat", icon: "💬" },
          { id: "dashboard", label: "Dashboard", icon: "📊" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              letterSpacing: "0.2px",
              background: activeTab === tab.id ? "var(--bg-card)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
              borderTop: activeTab === tab.id ? "1px solid var(--border-hover)" : "1px solid transparent",
              transition: "all 0.15s ease",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <span style={{ fontSize: "11px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* Clear chat button */}
        {activeTab === "chat" && (
          <button
            onClick={onClearChat}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--red)"
              e.currentTarget.style.color = "var(--red)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)"
              e.currentTarget.style.color = "var(--text-secondary)"
            }}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.3px",
              transition: "all 0.15s ease"
            }}
          >
            Clear
          </button>
        )}

        {/* Live indicator */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: "6px", fontSize: "11px",
          color: "var(--text-secondary)",
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <div style={{
            width: "6px", height: "6px",
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 6px var(--accent)",
            animation: "pulse-dot 2s ease infinite",
            flexShrink: 0
          }} />
          <span className="header-txn-count">250K txns · 2024</span>
        </div>

      </div>

    </header>
  )
}