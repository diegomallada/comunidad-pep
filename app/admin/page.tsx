"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/NavBar";

type Denuncia = {
  id: string;
  created_at: string;
  denunciado_id: string;
  motivo: string | null;
  captura_url: string | null;
  revisada: boolean;
  denunciado_nombre?: string | null;
  captura_firmada?: string | null;
};

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);

  async function cargarDenuncias() {
    const { data } = await supabase
      .from("denuncias")
      .select("*")
      .order("created_at", { ascending: false });

    const lista = data ?? [];

    // Para cada denuncia, traer el nombre del denunciado y firmar la captura
    const enriquecidas = await Promise.all(
      lista.map(async (d: Denuncia) => {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("nombre")
          .eq("id", d.denunciado_id)
          .maybeSingle();

        let firmada: string | null = null;
        if (d.captura_url) {
          const { data: signed } = await supabase.storage
            .from("denuncias")
            .createSignedUrl(d.captura_url, 3600);
          firmada = signed?.signedUrl ?? null;
        }
        return {
          ...d,
          denunciado_nombre: perfil?.nombre ?? "(perfil ya eliminado)",
          captura_firmada: firmada,
        };
      })
    );
    setDenuncias(enriquecidas);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      // Comprobar si es admin usando la función de la base de datos
      const { data: esAdmin } = await supabase.rpc("es_admin");
      if (!esAdmin) {
        setAutorizado(false);
        setCargando(false);
        return;
      }
      setAutorizado(true);
      await cargarDenuncias();
      setCargando(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function expulsar(denunciadoId: string, nombre: string) {
    const ok = window.confirm(
      `¿Expulsar a ${nombre} de la comunidad? Se borrará su perfil y datos. Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    await supabase.from("profiles").delete().eq("id", denunciadoId);
    await cargarDenuncias();
  }

  async function marcarRevisada(id: string) {
    await supabase.from("denuncias").update({ revisada: true }).eq("id", id);
    await cargarDenuncias();
  }

  if (cargando) {
    return (
      <main style={styles.main}>
        <p style={styles.info}>Cargando…</p>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.info}>No tienes acceso a esta página.</p>
          <button style={styles.boton} onClick={() => router.push("/buscar")}>
            Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.wrap}>
        <h1 style={styles.titulo}>Administración · Denuncias</h1>

        {denuncias.length === 0 ? (
          <p style={styles.info}>No hay denuncias.</p>
        ) : (
          denuncias.map((d) => (
            <div
              key={d.id}
              style={{
                ...styles.denuncia,
                opacity: d.revisada ? 0.6 : 1,
              }}
            >
              <div style={styles.denunciaCabecera}>
                <strong style={styles.denunciado}>{d.denunciado_nombre}</strong>
                <span style={styles.fecha}>
                  {new Date(d.created_at).toLocaleDateString("es-ES")}
                  {d.revisada ? " · revisada" : ""}
                </span>
              </div>

              <p style={styles.motivo}>{d.motivo || "(sin motivo)"}</p>

              {d.captura_firmada && (
                // eslint-disable-next-line @next/next/no-img-element
                <a href={d.captura_firmada} target="_blank" rel="noreferrer">
                  <img src={d.captura_firmada} alt="captura" style={styles.captura} />
                </a>
              )}

              <div style={styles.acciones}>
                <button
                  style={styles.expulsar}
                  onClick={() => expulsar(d.denunciado_id, d.denunciado_nombre || "este usuario")}
                >
                  Expulsar de la comunidad
                </button>
                {!d.revisada && (
                  <button style={styles.revisar} onClick={() => marcarRevisada(d.id)}>
                    Marcar revisada
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    <NavBar />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#F4ECDD", padding: "32px 20px 90px" },
  wrap: { maxWidth: "720px", margin: "0 auto" },
  titulo: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "28px",
    marginBottom: "24px",
    textAlign: "center",
  },
  card: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "14px",
    padding: "32px",
    maxWidth: "420px",
    margin: "0 auto",
    textAlign: "center",
  },
  info: { textAlign: "center", color: "#8A7C6B", fontSize: "16px" },
  denuncia: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  },
  denunciaCabecera: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "8px",
  },
  denunciado: { color: "#33291F", fontSize: "17px" },
  fecha: { color: "#8A7C6B", fontSize: "13px" },
  motivo: { color: "#5C5042", fontSize: "15px", lineHeight: 1.5, marginBottom: "12px" },
  captura: {
    maxWidth: "100%",
    maxHeight: "260px",
    borderRadius: "8px",
    border: "1px solid #E0D2BC",
    marginBottom: "12px",
    display: "block",
  },
  acciones: { display: "flex", gap: "10px", flexWrap: "wrap" },
  expulsar: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#9A4A2E",
    color: "#FBF4E9",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  revisar: {
    padding: "10px 18px",
    border: "1px solid #D8BFA9",
    borderRadius: "8px",
    background: "transparent",
    color: "#8A7C6B",
    fontSize: "14px",
    cursor: "pointer",
  },
  boton: {
    marginTop: "16px",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
