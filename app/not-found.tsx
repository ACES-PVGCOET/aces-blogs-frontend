import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "'Courier Prime', monospace",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          border: "4px solid #000000",
          padding: "3rem 2rem",
          maxWidth: "520px",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "0.8rem", letterSpacing: "0.2em", fontWeight: 700 }}>
          ACES TECHNICAL GAZETTE · DISPATCH NOT FOUND
        </span>
        <h1
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: "3.5rem",
            margin: "1rem 0 0.5rem",
            lineHeight: 1,
          }}
        >
          404 · MISSING
        </h1>
        <p style={{ fontFamily: "Merriweather, serif", fontSize: "0.95rem", margin: "1rem 0 2rem" }}>
          The requested dispatch, author pass, or chronicle folio could not be retrieved from the archives.
        </p>
        <Link
          href="/writer-profile.html"
          style={{
            display: "inline-block",
            border: "2px solid #000000",
            backgroundColor: "#000000",
            color: "#ffffff",
            padding: "0.6rem 1.4rem",
            textDecoration: "none",
            fontWeight: 900,
            fontSize: "0.82rem",
            letterSpacing: "0.05em",
          }}
        >
          ➔ RETURN TO WRITER DESK
        </Link>
      </div>
    </main>
  );
}
