"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      setError("Invalid password. Try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1E2640",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "48px 40px",
        width: 360,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 10,
            letterSpacing: 3,
            background: "linear-gradient(90deg, #2F80FF, #7B61FF, #FF4EDB)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}>
            AI MONETIZATION
          </div>
          <h1 style={{ color: "#F5F7FA", fontSize: 22, fontWeight: 700, margin: 0 }}>
            Mission Control
          </h1>
          <p style={{ color: "#6B7186", fontSize: 13, marginTop: 8 }}>
            Enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#F5F7FA",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />

          {error && (
            <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #2F80FF, #7B61FF)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
