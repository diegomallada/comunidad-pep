"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Sustituye este ID por el del vídeo de YouTube de Pep.
// El ID es la parte que va después de "v=" o "youtu.be/".
// Ej: https://youtu.be/ABC123  ->  YOUTUBE_ID = "ABC123"
const YOUTUBE_ID = "ZMv0s-x3Y58";

export default function PortadaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [logueado, setLogueado] = useState(false);

  useEffect(() => {
    async function comprobar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLogueado(!!user);
    }
    comprobar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={styles.main}>
      <div style={styles.contenido}>
        {/* Monograma */}
        <div style={styles.monograma}>PB</div>

        <h1 style={styles.titulo}>Comunidad Pep Borrell</h1>
        <p style={styles.lema}>el amor que permanece</p>

        {/* Texto de presentación (Pep pondrá el suyo) */}
        <p style={styles.intro}>
          Un espacio para católicos que buscan, con fe y con verdad, una
          relación seria orientada al matrimonio. Personas auténticas, que viven
          su fe y desean compartir el camino.
        </p>

        {/* Vídeo */}
        {YOUTUBE_ID ? (
          <div style={styles.videoWrap}>
            <iframe
              style={styles.video}
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}`}
              title="Vídeo de Pep Borrell"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div style={styles.videoWrap}>
            <div style={styles.videoPlaceholder}>Aquí irá el vídeo de Pep</div>
          </div>
        )}

        {/* Botones */}
        <div style={styles.botonera}>
          {logueado ? (
            <button style={styles.botonPrimario} onClick={() => router.push("/buscar")}>
              Entrar a mi cuenta
            </button>
          ) : (
            <>
              <button style={styles.botonPrimario} onClick={() => router.push("/registro")}>
                Crear cuenta
              </button>
              <button style={styles.botonSecundario} onClick={() => router.push("/login")}>
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#F4ECDD",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  contenido: {
    maxWidth: "640px",
    width: "100%",
    textAlign: "center",
  },
  monograma: {
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontFamily: "Georgia, serif",
    fontSize: "40px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  titulo: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "38px",
    fontWeight: 600,
    marginBottom: "6px",
  },
  lema: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    color: "#9A4A2E",
    fontSize: "20px",
    marginBottom: "28px",
  },
  intro: {
    color: "#5C5042",
    fontSize: "17px",
    lineHeight: 1.6,
    marginBottom: "32px",
    maxWidth: "520px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  videoWrap: {
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%", // proporción 16:9
    height: 0,
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "36px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
  },
  videoPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "#EADDC9",
    border: "1px dashed #D8BFA9",
    borderRadius: "14px",
    color: "#8A7C6B",
    fontSize: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  botonera: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  botonPrimario: {
    padding: "15px 36px",
    border: "none",
    borderRadius: "10px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
  },
  botonSecundario: {
    padding: "15px 36px",
    border: "1px solid #B85C3C",
    borderRadius: "10px",
    background: "transparent",
    color: "#B85C3C",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
