import React, { useState, useEffect } from "react";
import { CallAnalysis, CallStats } from "./types";
import "./App.css";

const App: React.FC = () => {
  const [calls, setCalls] = useState<CallAnalysis[]>([]);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // API Base URL - Use environment variable or default to Render deployment
  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://stylehub-server-lgna.onrender.com";

  // Fetch data from our API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [callsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/calls`),
        fetch(`${API_BASE_URL}/api/dashboard/stats`),
      ]);

      if (!callsResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const callsData = await callsResponse.json();
      const statsData = await statsResponse.json();

      setCalls(callsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relativeTime = "";
    if (diffMinutes < 1) {
      relativeTime = "Just now";
    } else if (diffMinutes < 60) {
      relativeTime = `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours}h ago`;
    } else {
      relativeTime = `${diffDays}d ago`;
    }

    const absoluteTime = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return { relativeTime, absoluteTime };
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case "order_lookup":
        return "📦";
      case "return_request":
        return "↩️";
      default:
        return "💬";
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success ? "✅ Success" : "❌ Failed";
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      elevenlabs: {
        icon: "🤖",
        label: "11labs Call",
        class: "source-elevenlabs",
      },
      test: { icon: "🧪", label: "Test Call", class: "source-test" },
      manual: { icon: "👤", label: "Manual Entry", class: "source-manual" },
    };
    const badge = badges[source as keyof typeof badges] || badges.elevenlabs;
    return { ...badge };
  };

  if (loading && calls.length === 0) {
    return (
      <div className={`loading ${darkMode ? "dark" : "light"}`}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
      <header className="header">
        <h1>
          <span className="header-icon">🎯</span>
          <span className="header-text">StyleHub AI Agent Dashboard</span>
        </h1>
        <div className="header-controls">
          <button onClick={toggleDarkMode} className="theme-toggle">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={fetchData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </header>

      {error && <div className="error-banner">⚠️ Error: {error}</div>}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📞</div>
            <div className="stat-content">
              <h3>Total Calls</h3>
              <p>{stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Success Rate</h3>
              <p>{stats.successRate}%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Order Lookups</h3>
              <p>{stats.orderLookups}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">↩️</div>
            <div className="stat-content">
              <h3>Returns</h3>
              <p>{stats.returns}</p>
            </div>
          </div>
        </div>
      )}

      {/* Call History */}
      <div className="calls-section">
        <h2>📋 Recent Calls</h2>

        {calls.length === 0 ? (
          <div className="empty-state">
            <p>No calls recorded yet. Make a test call to see data here!</p>
            <div className="test-instructions">
              <h4>🧪 Test the system:</h4>
              <ol>
                <li>
                  Run test script: <code>node test-scripts/test-apis.js</code>
                </li>
                <li>
                  Configure n8n to send to:{" "}
                  <code>
                    https://stylehub-server-lgna.onrender.com/webhook/call-analysis
                  </code>
                </li>
                <li>Make a test call via 11labs and ask about order 001</li>
                <li>Watch the data appear here in real-time!</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="calls-list">
            {calls.map((call) => {
              const sourceBadge = getSourceBadge(call.source || "elevenlabs");
              return (
                <div key={call.id} className="call-card">
                  <div className="call-header">
                    <div className="call-type">
                      {getCallTypeIcon(call.callType)}{" "}
                      {call.callType.replace("_", " ")}
                    </div>
                    <div className={`call-source ${sourceBadge.class}`}>
                      {sourceBadge.icon} {sourceBadge.label}
                    </div>
                    <div className="call-status">
                      {getStatusBadge(call.success)}
                    </div>
                    <div className="call-time">
                      {(() => {
                        const time = formatTimestamp(call.timestamp);
                        return (
                          <>
                            <div className="relative-time">
                              {time.relativeTime}
                            </div>
                            <div className="absolute-time">
                              {time.absoluteTime}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="call-details">
                    {call.orderId && (
                      <div className="detail-item">
                        <strong>Order ID:</strong> {call.orderId}
                      </div>
                    )}
                    {call.rmaNumber && (
                      <div className="detail-item">
                        <strong>RMA Number:</strong> {call.rmaNumber}
                      </div>
                    )}
                    {call.duration && (
                      <div className="detail-item">
                        <strong>Duration:</strong> {call.duration}s
                      </div>
                    )}
                  </div>

                  <div className="call-analysis">
                    <div className="analysis-content">
                      <strong>Call Analysis:</strong> {call.analysis}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
