"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleLogin() {
    setError(null);
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setCargando(false);
      setError("Email o contraseña incorrectos.");
      return;
    }

    // Miramos en qué punto del proceso está el usuario
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let destino = "/oracion";
    if (user) {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("oracion_completada, cuestionario_completado")
        .eq("id", user.id)
        .single();

      if (perfil?.cuestionario_completado) destino = "/buscar";
      else if (perfil?.oracion_completada) destino = "/cuestionario";
      else destino = "/oracion";
    }

    setCargando(false);
    router.push(destino);
    router.refresh();
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Entrar</h1>
        <p style={styles.subtitulo}>Comunidad Pep Borrell</p>

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
          placeholder="Tu contraseña"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.boton} onClick={handleLogin} disabled={cargando}>
          {cargando ? "Entrando..." : "Entrar"}
        </button>

        <p style={styles.pie}>
          <a href="/recuperar" style={styles.enlace}>
            ¿Olvidaste tu contraseña?
          </a>
        </p>
        <p style={styles.pie}>
          ¿No tienes cuenta?{" "}
          <a href="/registro" style={styles.enlace}>
            Crear cuenta
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
  error: { color: "#9A4A2E", fontSize: "14px", marginTop: "16px" },
  pie: {
    marginTop: "16px",
    textAlign: "center",
    color: "#8A7C6B",
    fontSize: "14px",
  },
  enlace: { color: "#B85C3C", fontWeight: 600, textDecoration: "none" },
};
