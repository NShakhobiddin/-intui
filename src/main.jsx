import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { initTelegram } from "./telegram.js";
import App from "./App.jsx";

// Kutilmagan xatoda oq sahifa o'rniga qayta yuklash taklifi
class Boundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{
        position: "fixed", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18, padding: 24,
        background: "#06050e", color: "#f2f0ff", textAlign: "center",
        fontFamily: "Manrope, system-ui, sans-serif",
      }}>
        <div style={{ fontSize: 40 }}>✦</div>
        <div style={{ fontSize: 19, fontWeight: 700 }}>Nimadir xato ketdi</div>
        <div style={{ fontSize: 14, color: "#9d96c7", maxWidth: 280, lineHeight: 1.5 }}>Ilovani qayta yuklab ko'ring — ma'lumotlaringiz saqlangan.</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8, padding: "14px 34px", borderRadius: 18, border: "none", cursor: "pointer",
            fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "inherit",
            background: "linear-gradient(180deg, hsl(247,90%,79%), hsl(247,70%,58%))",
          }}>
          Qayta yuklash
        </button>
      </div>
    );
  }
}

initTelegram();
createRoot(document.getElementById("root")).render(<Boundary><App /></Boundary>);
