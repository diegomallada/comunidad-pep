"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Calcula la edad a partir de una fecha (YYYY-MM-DD)
function calcularEdad(fechaNac: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function RegistroPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Popup de privacidad
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [aceptado, setAceptado] = useState(false);

  // Paso 1: validar campos y abrir el popup de privacidad
  function intentarRegistro() {
    setError(null);

    if (!nombre || !email || !password || !fechaNac) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (calcularEdad(fechaNac) < 18) {
      setError("Debes ser mayor de edad para registrarte.");
      return;
    }

    // Si aún no ha aceptado la privacidad, mostramos el popup
    if (!aceptado) {
      setMostrarPopup(true);
      return;
    }
    registrar();
  }

  // Paso 2: registro real (tras aceptar privacidad)
  async function registrar() {
    setCargando(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setCargando(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ nombre, fecha_nacimiento: fechaNac })
        .eq("id", data.user.id);
    }

    setEnviado(true);
  }

  function aceptarPrivacidad() {
    setAceptado(true);
    setMostrarPopup(false);
    registrar();
  }

  if (enviado) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.titulo}>Revisa tu correo</h1>
          <p style={styles.textoNegro}>
            Te hemos enviado un email a <strong>{email}</strong> de parte de
            Comunidad Pep Borrell para confirmar tu cuenta. Ábrelo y pulsa el
            enlace para continuar. Si no lo ves, revisa la carpeta de spam.
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

        <label style={styles.label}>Nombre (obligatorio)</label>
        <input
          style={styles.input}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
        />

        <label style={styles.label}>Email (obligatorio)</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tucorreo@ejemplo.com"
        />

        <label style={styles.label}>Fecha de nacimiento (obligatorio)</label>
        <input
          style={styles.input}
          type="date"
          value={fechaNac}
          onChange={(e) => setFechaNac(e.target.value)}
        />

        <label style={styles.label}>Contraseña (obligatorio)</label>
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />

        <p style={styles.avisoTelegram}>
          Para poder chatear con otras personas necesitarás una cuenta de
          Telegram. Si no la tienes, puedes crearla gratis en telegram.org.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.boton} onClick={intentarRegistro} disabled={cargando}>
          {cargando ? "Creando..." : "Crear cuenta"}
        </button>

        <p style={styles.pie}>
          ¿Ya tienes cuenta? <a href="/login" style={styles.enlace}>Entrar</a>
        </p>
      </div>

      {/* Popup de privacidad que bloquea hasta aceptar */}
      {mostrarPopup && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <h2 style={styles.popupTitulo}>Protección de tus datos</h2>
            <div style={styles.popupTexto}>
              <p style={{ marginBottom: 10 }}>
                Antes de continuar, necesitamos tu consentimiento. Comunidad Pep
                Borrell tratará tus datos personales —incluidos los relativos a
                tus <strong>creencias religiosas</strong> y tu fotografía— con el
                único fin de ofrecerte este servicio de contacto entre personas
                católicas.
              </p>
              <p style={{ marginBottom: 10 }}>
                Tus datos no se venden ni se usan con fines publicitarios. Podrás
                acceder, modificar o eliminar tu cuenta y todos tus datos en
                cualquier momento. Puedes leer todos los detalles en nuestra{" "}
                <a href="/privacidad" target="_blank" style={styles.enlace}>
                  política de privacidad
                </a>
                .
              </p>
              <p>
                Al aceptar, confirmas que eres mayor de edad y que consientes de
                forma expresa este tratamiento de tus datos.
              </p>
            </div>
            <div style={styles.popupBotones}>
              <button style={styles.popupCancelar} onClick={() => setMostrarPopup(false)}>
                Cancelar
              </button>
              <button style={styles.popupAceptar} onClick={aceptarPrivacidad}>
                Acepto y continúo
              </button>
            </div>
          </div>
        </div>
      )}
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
  titulo: { fontFamily: "Georgia, serif", color: "#33291F", fontSize: "28px", marginBottom: "4px" },
  subtitulo: { fontFamily: "Georgia, serif", fontStyle: "italic", color: "#9A4A2E", marginBottom: "24px" },
  texto: { color: "#5C5042", fontSize: "15px", lineHeight: 1.5 },
  textoNegro: { color: "#33291F", fontSize: "15px", lineHeight: 1.6 },
  label: { display: "block", color: "#5C5042", fontSize: "14px", marginTop: "16px", marginBottom: "6px" },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #E0D2BC",
    borderRadius: "8px",
    background: "#FFFCF6",
    color: "#33291F",
    fontSize: "15px",
  },
  avisoTelegram: {
    color: "#5C5042",
    fontSize: "13px",
    fontStyle: "italic",
    marginTop: "16px",
    lineHeight: 1.5,
    background: "#F3E0D5",
    padding: "10px 12px",
    borderRadius: "8px",
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
  error: { color: "#9A4A2E", fontSize: "14px", marginTop: "16px" },
  pie: { marginTop: "20px", textAlign: "center", color: "#8A7C6B", fontSize: "14px" },
  enlace: { color: "#B85C3C", fontWeight: 600, textDecoration: "none" },
  // Popup
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(51,41,31,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  popup: {
    background: "#FBF4E9",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },
  popupTitulo: { fontFamily: "Georgia, serif", color: "#9A4A2E", fontSize: "22px", marginBottom: "16px" },
  popupTexto: { color: "#33291F", fontSize: "14px", lineHeight: 1.6 },
  popupBotones: { display: "flex", gap: "12px", marginTop: "24px" },
  popupCancelar: {
    flex: 1,
    padding: "12px",
    border: "1px solid #D8BFA9",
    borderRadius: "8px",
    background: "transparent",
    color: "#8A7C6B",
    fontSize: "15px",
    cursor: "pointer",
  },
  popupAceptar: {
    flex: 2,
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
