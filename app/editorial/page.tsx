"use client";

import { useEffect } from "react";

export default function EditorialPage() {
  useEffect(() => {
    window.location.replace("/editorial-board.html");
  }, []);

  return (
    <main
      style={{
        padding: "4rem 2rem",
        fontFamily: "Courier Prime, Courier, monospace",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <h1 style={{ fontFamily: "Anton, sans-serif", fontSize: "2rem", textTransform: "uppercase" }}>
        ACES EDITORIAL BOARD
      </h1>
      <p style={{ marginTop: "1rem" }}>
        ➔ Transferring to Academic Accreditation Registry...
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <a
          href="/editorial-board.html"
          style={{
            border: "2px solid #000",
            padding: "0.5rem 1rem",
            textDecoration: "none",
            color: "#000",
            fontWeight: 900,
          }}
        >
          OPEN EDITORIAL DESK DIRECTLY
        </a>
      </p>
    </main>
  );
}

