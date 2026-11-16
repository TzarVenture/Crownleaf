"use client";

// Last-resort error page: replaces the whole document if the root layout itself fails.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FAF8F5", color: "#003108" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", textAlign: "center" }}>
          <div role="alert" style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Something went wrong</h1>
            <p style={{ color: "#57534e", lineHeight: 1.6 }}>Please reload the page. If this keeps happening, contact us on WhatsApp.</p>
            <button
              type="button"
              onClick={() => reset()}
              style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", background: "#8E6935", color: "#fff", border: 0, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
