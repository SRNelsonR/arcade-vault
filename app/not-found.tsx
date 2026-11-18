import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fade-in" style={{ textAlign: "center", padding: "96px 16px" }}>
      <div className="pixel neon-magenta flicker" style={{ fontSize: 14, marginBottom: 20 }}>
        ERROR 404
      </div>
      <h1 className="pixel neon-cyan" style={{ fontSize: 28, marginBottom: 16 }}>
        JUEGO NO ENCONTRADO
      </h1>
      <p style={{ color: "var(--ink-faint)", marginBottom: 32 }}>
        Este cartucho no existe en el vault. Inserta otra moneda e inténtalo de nuevo.
      </p>
      <Link href="/" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
