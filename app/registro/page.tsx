"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegistroPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function handleRegistro() {
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setCargando(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // El nombre se guarda y luego lo volcamos al perfil
        data: { nombre },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Si hay usuario y se ha enviado correo de confirmación
    if (data.user) {
      // Guardamos el nombre en su perfil
      await supabase
        .from("profiles")
        .update({ nombre })
        .eq("id", data.user.id);
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.titulo}>Revisa tu correo</h1>
          <p style={styles.texto}>
            Te hemos enviado un email a <strong>{email}</strong> para confirmar
            tu cuenta. Ábrelo y pulsa el enlace para continuar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Crear cuenta</h1>
        <p style={styles.subtitulo}>Comunidad Pep Borrell</p>

        <label style={styles.label}>Nombre</label>
        <input
          style={styles.input}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
        />

        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
        />

        <label style={styles.label}>Contraseña</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={styles.boton}
          onClick={handleRegistro}
          disabled={cargando}
        >
          {cargando ? "Creando..." : "Crear cuenta"}
        </button>

        <p style={styles.pie}>
          ¿Ya tienes cuenta? <a href="/login" style={styles.enlace}>Entrar</a>
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
    fontSize: "28px",
    marginBottom: "4px",
  },
  subtitulo: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    color: "#9A4A2E",
    marginBottom: "24px",
  },
  label: {
    display: "block",
    color: "#5C5042",
    fontSize: "14px",
    marginTop: "16px",
    marginBottom: "6px",
  },
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
    marginTop: "28px",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#9A4A2E",
    fontSize: "14px",
    marginTop: "16px",
  },
  pie: {
    marginTop: "20px",
    textAlign: "center",
    color: "#8A7C6B",
    fontSize: "14px",
  },
  enlace: { color: "#B85C3C", fontWeight: 600, textDecoration: "none" },
};
