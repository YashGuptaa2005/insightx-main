import { useState, useEffect } from "react"
import axios from "axios"

function StatCard({ title, value, subtitle, icon, accent = false }) {
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: `1px solid ${accent ? "rgba(0,212,160,0.3)" : "var(--border)"}`,
      borderRadius: "14px",
      padding: "20px",
      boxShadow: accent ? "0 0 20px rgba(0,212,160,0.05)" : "none"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "12px"
      }}>
        <span style={{
          fontSize: "10px", fontWeight: "500",
          color: "var(--text-secondary)",
          textTransform: "uppercase", letterSpacing: "0.8px",
          fontFamily: "'JetBrains Mono', monospace"
        }}>{title}</span>
        <span style={{ fontSize: "16px" }}>{icon}</span>
      </div>
      <div style={{
        fontSize: "26px", fontWeight: "600",
        color: accent ? "var(--accent)" : "var(--text-primary)",
        letterSpacing: "-0.5px", marginBottom: "4px"
      }}>{value}</div>
      <div style={{
        fontSize: "11px", color: "var(--text-secondary)"
      }}>{subtitle}</div>
    </div>
  )
}

function BarRow({ label, value, max, color = "var(--accent)" }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginBottom: "5px"
      }}>
        <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{label}</span>
        <span style={{
          fontSize: "11px", color: "var(--text-secondary)",
          fontFamily: "'JetBrains Mono', monospace"
        }}>{value.toLocaleString()}</span>
      </div>
      <div style={{
        height: "3px", background: "var(--border)",
        borderRadius: "10px", overflow: "hidden"
      }}>
        <div style={{
          height: "100%", borderRadius: "10px",
          width: `${pct}%`, background: color,
          transition: "width 0.8s ease",
          boxShadow: `0 0 6px ${color}40`
        }} />
      </div>
    </div>
  )
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      padding: "20px"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "13px", fontWeight: "500",
          color: "var(--text-primary)", marginBottom: "3px"
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontSize: "11px", color: "var(--text-secondary)",
            fontFamily: "'JetBrains Mono', monospace"
          }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  )
}

function LoadingCard() {
  return (
    <div style={{
      borderRadius: "14px",
      height: "120px",
      backgroundImage: "linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-card) 50%, var(--bg-secondary) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite"
    }} />
  )
}

export default function SummaryCards() {
  const [summary, setSummary] = useState(null)
  const [failures, setFailures] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, f, t] = await Promise.all([
          axios.get("http://localhost:8000/api/summary"),
          axios.get("http://localhost:8000/api/data/failures"),
          axios.get("http://localhost:8000/api/data/trends")
        ])
        setSummary(s.data)
        setFailures(f.data)
        setTrends(t.data)
      } catch (err) {
        console.error("Failed to fetch", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const peakHours = trends?.by_hour?.filter(
    h => h.hour_of_day >= 18 && h.hour_of_day <= 22
  ) || []
  const avgPeakSuccess = peakHours.length
    ? (peakHours.reduce((a, b) => a + b.success_rate, 0) / peakHours.length).toFixed(1)
    : "—"

  const txTypes = summary?.transaction_types || {}
  const maxTx = Math.max(...Object.values(txTypes), 1)
  const merchantFails = failures?.by_merchant_category || {}
  const maxFail = Math.max(...Object.values(merchantFails), 1)
  const networkFails = failures?.by_network || {}
  const maxNet = Math.max(...Object.values(networkFails), 1)
  const deviceFails = failures?.by_device || {}
  const maxDev = Math.max(...Object.values(deviceFails), 1)
  const bankFails = failures?.by_bank || {}
  const maxBank = Math.max(...Object.values(bankFails), 1)

  return (
    <div style={{
      height: "100%", overflowY: "auto",
      background: "var(--bg-primary)",
      padding: "24px 24px 40px"
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            gap: "8px", marginBottom: "4px"
          }}>
            <div style={{
              width: "6px", height: "6px",
              borderRadius: "50%", background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)"
            }} />
            <span style={{
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--accent)", letterSpacing: "0.8px",
              textTransform: "uppercase"
            }}>Live Dashboard</span>
          </div>
          <h1 style={{
            fontSize: "18px", fontWeight: "600",
            color: "var(--text-primary)", letterSpacing: "-0.3px"
          }}>Analytics Overview</h1>
          <p style={{
            fontSize: "12px", color: "var(--text-secondary)", marginTop: "3px"
          }}>250,000 UPI transactions · January – December 2024</p>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px", marginBottom: "16px"
        }}>
          {loading ? (
            [1,2,3,4].map(i => <LoadingCard key={i} />)
          ) : (
            <>
              <StatCard title="Total Transactions" value={summary?.total_transactions?.toLocaleString()} subtitle="Jan – Dec 2024" icon="📊" />
              <StatCard title="Success Rate" value={`${summary?.success_rate}%`} subtitle="Overall platform" icon="✅" accent />
              <StatCard title="Total Volume" value={`₹${summary?.total_amount_crores}Cr`} subtitle="Across all types" icon="💰" />
              <StatCard title="Peak Hour Success" value={`${avgPeakSuccess}%`} subtitle="6 PM – 10 PM window" icon="⏱️" />
            </>
          )}
        </div>

        {/* Row 2 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px", marginBottom: "12px"
        }}>
          {loading ? (
            [1,2].map(i => <LoadingCard key={i} />)
          ) : (
            <>
              <SectionCard title="Transaction Volume by Type" subtitle="All transactions">
                {Object.entries(txTypes).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
                  <BarRow key={type} label={type} value={count} max={maxTx} color="var(--accent)" />
                ))}
              </SectionCard>
              <SectionCard title="Failures by Merchant Category" subtitle="P2M transactions only">
                {Object.entries(merchantFails).sort((a,b) => b[1]-a[1]).slice(0,6).map(([cat, count]) => (
                  <BarRow key={cat} label={cat} value={count} max={maxFail} color="var(--red)" />
                ))}
              </SectionCard>
            </>
          )}
        </div>

        {/* Row 3 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px"
        }}>
          {loading ? (
            [1,2,3].map(i => <LoadingCard key={i} />)
          ) : (
            <>
              <SectionCard title="Failures by Network" subtitle="All transaction types">
                {Object.entries(networkFails).sort((a,b) => b[1]-a[1]).map(([net, count]) => (
                  <BarRow key={net} label={net} value={count} max={maxNet} color="var(--amber)" />
                ))}
              </SectionCard>
              <SectionCard title="Failures by Device" subtitle="All transaction types">
                {Object.entries(deviceFails).sort((a,b) => b[1]-a[1]).map(([dev, count]) => (
                  <BarRow key={dev} label={dev} value={count} max={maxDev} color="var(--blue)" />
                ))}
              </SectionCard>
              <SectionCard title="Top Failing Banks" subtitle="By sender bank">
                {Object.entries(bankFails).sort((a,b) => b[1]-a[1]).map(([bank, count]) => (
                  <BarRow key={bank} label={bank} value={count} max={maxBank} color="#a855f7" />
                ))}
              </SectionCard>
            </>
          )}
        </div>

      </div>
    </div>
  )
}