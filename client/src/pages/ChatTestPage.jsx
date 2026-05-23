import { useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const HUB_URL = "https://localhost:7244/hubs/chat";

export default function ChatTestPage() {
  const [connection, setConnection] = useState(null);
  const [status, setStatus] = useState("Disconnected");
  const [conversationId, setConversationId] = useState(
    "11111111-1111-1111-1111-111111111111"
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const messagesEndRef = useRef(null);

  const canSend = useMemo(() => {
    return connection && status === "Connected" && message.trim() && conversationId.trim();
  }, [connection, status, message, conversationId]);

  const addLog = (text) => {
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()} - ${text}`,
      ...prev,
    ]);
  };

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.on("ReceiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      addLog(`Received message from ${data.senderUsername}`);
    });

    newConnection.onreconnecting(() => {
      setStatus("Reconnecting...");
      addLog("Reconnecting...");
    });

    newConnection.onreconnected(() => {
      setStatus("Connected");
      addLog("Reconnected");
    });

    newConnection.onclose(() => {
      setStatus("Disconnected");
      addLog("Connection closed");
    });

    async function startConnection() {
      try {
        await newConnection.start();
        setStatus("Connected");
        addLog("Connected to SignalR hub");
      } catch (err) {
        console.error(err);
        setStatus("Connection failed");
        addLog("Connection failed");
      }
    }

    startConnection();
    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinConversation = async () => {
    if (!connection || !conversationId.trim()) return;

    try {
      await connection.invoke("JoinConversation", conversationId);
      addLog(`Joined conversation ${conversationId}`);
    } catch (err) {
      console.error(err);
      addLog("Failed to join conversation");
    }
  };

  const leaveConversation = async () => {
    if (!connection || !conversationId.trim()) return;

    try {
      await connection.invoke("LeaveConversation", conversationId);
      addLog(`Left conversation ${conversationId}`);
    } catch (err) {
      console.error(err);
      addLog("Failed to leave conversation");
    }
  };

  const sendMessage = async () => {
    if (!canSend) return;

    try {
      await connection.invoke("SendTestMessage", conversationId, message);
      addLog("Message sent");
      setMessage("");
    } catch (err) {
      console.error(err);
      addLog("Failed to send message");
    }
  };

  const clearMessages = () => {
    setMessages([]);
    addLog("Messages cleared");
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>SignalR Chat Test</h1>
            <p style={styles.subtitle}>
              Frontend test page for your real-time chat feature
            </p>
          </div>
          <div
            style={{
              ...styles.statusBadge,
              backgroundColor:
                status === "Connected"
                  ? "#dcfce7"
                  : status === "Reconnecting..."
                  ? "#fef3c7"
                  : "#fee2e2",
              color:
                status === "Connected"
                  ? "#166534"
                  : status === "Reconnecting..."
                  ? "#92400e"
                  : "#991b1b",
            }}
          >
            {status}
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.sidebar}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Connection</h2>

              <label style={styles.label}>Hub URL</label>
              <input
                style={styles.inputDisabled}
                value={HUB_URL}
                disabled
                readOnly
              />

              <label style={styles.label}>Conversation ID</label>
              <input
                style={styles.input}
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                placeholder="Enter conversation ID"
              />

              <div style={styles.buttonRow}>
                <button style={styles.primaryButton} onClick={joinConversation}>
                  Join
                </button>
                <button style={styles.secondaryButton} onClick={leaveConversation}>
                  Leave
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Actions</h2>

              <button style={styles.secondaryButtonFull} onClick={clearMessages}>
                Clear messages
              </button>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Logs</h2>
              <div style={styles.logBox}>
                {logs.length === 0 ? (
                  <p style={styles.emptyText}>No logs yet</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} style={styles.logItem}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={styles.chatSection}>
            <div style={styles.chatCard}>
              <div style={styles.chatHeader}>
                <h2 style={styles.cardTitle}>Messages</h2>
                <span style={styles.messageCount}>{messages.length} total</span>
              </div>

              <div style={styles.messagesBox}>
                {messages.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p style={styles.emptyTitle}>No messages yet</p>
                    <p style={styles.emptyText}>
                      Join a conversation and send a test message.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} style={styles.messageBubble}>
                      <div style={styles.messageMeta}>
                        <span style={styles.sender}>{msg.senderUsername}</span>
                        <span style={styles.timestamp}>
                          {new Date(msg.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={styles.messageContent}>{msg.content}</div>
                      <div style={styles.conversationMeta}>
                        Conversation: {msg.conversationId}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.composer}>
                <input
                  style={styles.messageInput}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a test message"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button
                  style={{
                    ...styles.sendButton,
                    opacity: canSend ? 1 : 0.6,
                    cursor: canSend ? "pointer" : "not-allowed",
                  }}
                  onClick={sendMessage}
                  disabled={!canSend}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.tipBox}>
          <strong>How to test:</strong> Open this page in two browser tabs, use the
          same conversation ID in both tabs, click Join in both, then send a
          message from one tab. Both tabs should receive it instantly.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#0f172a",
  },
  wrapper: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#475569",
  },
  statusBadge: {
    padding: "10px 16px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: "24px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  chatSection: {
    minWidth: 0,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
  },
  chatCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px",
    minHeight: "720px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
  },
  cardTitle: {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: 700,
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    marginBottom: "14px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  inputDisabled: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    marginBottom: "14px",
    fontSize: "14px",
    background: "#f8fafc",
    color: "#64748b",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButtonFull: {
    width: "100%",
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: 600,
    cursor: "pointer",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "16px",
    flexWrap: "wrap",
  },
  messageCount: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },
  messagesBox: {
    flex: 1,
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px",
    overflowY: "auto",
    background: "#f8fafc",
    marginBottom: "16px",
    minHeight: "420px",
    maxHeight: "540px",
  },
  messageBubble: {
    background: "#ffffff",
    border: "1px solid #dbeafe",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "12px",
  },
  messageMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  sender: {
    fontWeight: 700,
    color: "#1d4ed8",
  },
  timestamp: {
    color: "#64748b",
    fontSize: "12px",
  },
  messageContent: {
    fontSize: "15px",
    lineHeight: 1.5,
    color: "#0f172a",
    marginBottom: "8px",
    wordBreak: "break-word",
  },
  conversationMeta: {
    color: "#64748b",
    fontSize: "12px",
  },
  composer: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  messageInput: {
    flex: 1,
    minWidth: "240px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
  },
  sendButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "14px 18px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  logBox: {
    maxHeight: "220px",
    overflowY: "auto",
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    fontSize: "12px",
  },
  logItem: {
    marginBottom: "8px",
    wordBreak: "break-word",
  },
  emptyState: {
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  emptyText: {
    color: "#64748b",
    margin: 0,
  },
  tipBox: {
    marginTop: "24px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    padding: "16px",
    borderRadius: "14px",
  },
};