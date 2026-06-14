"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleRecuperar() {
    setCargando(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setCargando(false);
    // Mostramos confirmación siempre (no revelamos si el email existe)
    setEnviado(true);
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Recuperar contraseña</h1>
        {enviado ? (
          <p style={styles.texto}>
            Si existe una cuenta con ese email, te hemos enviado un enlace para
            restablecer tu contraseña. Revisa tu correo.
          </p>
        ) : (
          <>
            <p style={styles.texto}>
              Escribe tu email y te enviaremos un enlace para crear una nueva
              contraseña.
            </p>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
            />
            <button
              style={styles.boton}
              onClick={handleRecuperar}
              disabled={cargando}
            >
              {cargando ? "Enviando..." : "Enviar enlace"}
            </button>
          </>
        )}
        <p style={styles.pie}>
          <a href="/login" style={styles.enlace}>
            Volver a entrar
          </a>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#F4ECDD",
    padding: "20px",
  },
  card: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  titulo: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "26px",
    marginBottom: "16px",
  },
  texto: { color: "#5C5042", fontSize: "15px", lineHeight: 1.5, marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #E0D2BC",
    borderRadius: "8px",
    background: "#FFFCF6",
    color: "#33291F",
    fontSize: "15px",
  },
  boton: {
    width: "100%",
    marginTop: "20px",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  pie: { marginTop: "20px", textAlign: "center", color: "#8A7C6B", fontSize: "14px" },
  enlace: { color: "#B85C3C", fontWeight: 600, textDecoration: "none" },
};
