"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/NavBar";

type Match = {
  id: string;
  nombre: string;
  edad: number | null;
  provincia: string | null;
  pais: string | null;
  foto_url: string | null;
  telegram: string | null;
};

export default function MatchesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      // Llamamos a la función segura que solo devuelve matches mutuos
      const { data } = await supabase.rpc("mis_matches");
      setMatches(data ?? []);
      setCargando(false);
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirTelegram(usuario: string) {
    window.open(`https://t.me/${usuario}`, "_blank", "noopener,noreferrer");
  }

  return (
    <main style={styles.main}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <h1 style={styles.titulo}>Mis matches</h1>
          <p style={styles.subtitulo}>el amor que permanece</p>
        </header>

        {cargando ? (
          <p style={styles.vacio}>Cargando…</p>
        ) : matches.length === 0 ? (
          <div style={styles.vacioCard}>
            <p style={styles.vacio}>
              Aún no tienes matches. Cuando alguien a quien marcaste también
              te marque, aparecerá aquí y podréis contactar.
            </p>
            <button style={styles.boton} onClick={() => router.push("/buscar")}>
              Ir a buscar
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {matches.map((m) => (
              <div key={m.id} style={styles.tarjeta}>
                {m.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.foto_url} alt={m.nombre} style={styles.foto} />
                ) : (
                  <div style={styles.fotoVacia}>Sin foto</div>
                )}
                <h3 style={styles.nombre}>
                  {m.nombre}
                  {m.edad ? `, ${m.edad}` : ""}
                </h3>
                {(m.provincia || m.pais) && (
                  <p style={styles.dato}>
                    {[m.provincia, m.pais].filter(Boolean).join(", ")}
                  </p>
                )}
                {m.telegram ? (
                  <button
                    style={styles.botonTelegram}
                    onClick={() => abrirTelegram(m.telegram!)}
                  >
                    Abrir Telegram
                  </button>
                ) : (
                  <p style={styles.sinTelegram}>Sin Telegram disponible</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    <NavBar />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#F4ECDD", padding: "32px 20px 90px" },
  wrap: { maxWidth: "900px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "28px" },
  titulo: { fontFamily: "Georgia, serif", color: "#33291F", fontSize: "32px" },
  subtitulo: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    color: "#9A4A2E",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
  },
  tarjeta: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  },
  foto: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #B85C3C",
    margin: "0 auto 12px",
    display: "block",
  },
  fotoVacia: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    background: "#F3E0D5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8A7C6B",
    fontSize: "13px",
    margin: "0 auto 12px",
  },
  nombre: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "19px",
    marginBottom: "4px",
  },
  dato: { color: "#5C5042", fontSize: "14px", marginBottom: "14px" },
  botonTelegram: {
    width: "100%",
    padding: "11px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  sinTelegram: { color: "#8A7C6B", fontSize: "13px", fontStyle: "italic" },
  vacio: {
    textAlign: "center",
    color: "#8A7C6B",
    fontSize: "16px",
    lineHeight: 1.6,
  },
  vacioCard: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "14px",
    padding: "40px",
    maxWidth: "440px",
    margin: "0 auto",
    textAlign: "center",
  },
  boton: {
    marginTop: "20px",
    padding: "13px 28px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
