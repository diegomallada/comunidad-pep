"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/NavBar";

type Perfil = {
  id: string;
  nombre: string;
  edad: number | null;
  provincia: string | null;
  pais: string | null;
  formacion: string | null;
  institucion: string | null;
  frecuencia_practica: string | null;
  sobre_mi: string | null;
  foto_url: string | null;
  sexo: string | null;
};

export default function PerfilPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const idPerfil = params.id as string;

  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [miId, setMiId] = useState<string | null>(null);
  const [yaLeGusta, setYaLeGusta] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [esMatch, setEsMatch] = useState(false);

  // Denuncia
  const [mostrarDenuncia, setMostrarDenuncia] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [captura, setCaptura] = useState<File | null>(null);
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false);
  const [denunciaEnviada, setDenunciaEnviada] = useState(false);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setMiId(user.id);

      // Datos del perfil (SIN telegram: eso solo en matches)
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, edad, provincia, pais, formacion, institucion, frecuencia_practica, sobre_mi, foto_url, sexo")
        .eq("id", idPerfil)
        .single();
      setPerfil(data);

      // ¿Ya le he dado "me interesa"?
      const { data: like } = await supabase
        .from("likes")
        .select("id")
        .eq("de_id", user.id)
        .eq("a_id", idPerfil)
        .maybeSingle();
      setYaLeGusta(!!like);

      // ¿Hay match? (la otra persona también me ha marcado)
      const { data: suLike } = await supabase
        .from("likes")
        .select("id")
        .eq("de_id", idPerfil)
        .eq("a_id", user.id)
        .maybeSingle();
      setEsMatch(!!like && !!suLike);

      setCargando(false);
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPerfil]);

  async function marcarInteres() {
    if (!miId) return;
    setProcesando(true);

    if (yaLeGusta) {
      // Quitar el "me interesa"
      await supabase.from("likes").delete().eq("de_id", miId).eq("a_id", idPerfil);
      setYaLeGusta(false);
      setEsMatch(false);
    } else {
      await supabase.from("likes").insert({ de_id: miId, a_id: idPerfil });
      setYaLeGusta(true);
      // Comprobar si ahora hay match
      const { data: suLike } = await supabase
        .from("likes")
        .select("id")
        .eq("de_id", idPerfil)
        .eq("a_id", miId)
        .maybeSingle();
      if (suLike) setEsMatch(true);
    }
    setProcesando(false);
  }

  async function enviarDenuncia() {
    if (!miId || !motivo.trim()) return;
    setEnviandoDenuncia(true);

    let capturaUrl: string | null = null;

    // Subir la captura si la hay
    if (captura) {
      const ext = captura.name.split(".").pop();
      const ruta = `${miId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("denuncias")
        .upload(ruta, captura, { upsert: false });
      if (!upErr) capturaUrl = ruta;
    }

    await supabase.from("denuncias").insert({
      denunciante_id: miId,
      denunciado_id: idPerfil,
      motivo: motivo.trim(),
      captura_url: capturaUrl,
    });

    setEnviandoDenuncia(false);
    setDenunciaEnviada(true);
    setMostrarDenuncia(false);
    setMotivo("");
    setCaptura(null);
  }

  if (cargando) {
    return (
      <main style={styles.main}>
        <p style={styles.cargando}>Cargando…</p>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.cargando}>Este perfil no está disponible.</p>
          <button style={styles.volver} onClick={() => router.push("/buscar")}>
            Volver a buscar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <button style={styles.volver} onClick={() => router.push("/buscar")}>
          ← Volver
        </button>

        {perfil.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={perfil.foto_url} alt={perfil.nombre} style={styles.foto} />
        ) : (
          <div style={styles.fotoVacia}>Sin foto</div>
        )}

        <h1 style={styles.nombre}>
          {perfil.nombre}
          {perfil.edad ? `, ${perfil.edad}` : ""}
        </h1>

        {(perfil.provincia || perfil.pais) && (
          <p style={styles.ubicacion}>
            {[perfil.provincia, perfil.pais].filter(Boolean).join(", ")}
          </p>
        )}

        {perfil.frecuencia_practica && (
          <p style={styles.etiqueta}>{perfil.frecuencia_practica}</p>
        )}

        <div style={styles.datos}>
          {perfil.formacion && (
            <p style={styles.dato}><strong>Profesión:</strong> {perfil.formacion}</p>
          )}
          {perfil.institucion && (
            <p style={styles.dato}><strong>Institución:</strong> {perfil.institucion}</p>
          )}
          {perfil.sobre_mi && (
            <p style={styles.sobreMi}>{perfil.sobre_mi}</p>
          )}
        </div>

        {esMatch && (
          <p style={styles.matchAviso}>
            ¡Hay match! Encontraréis cómo contactar en "Mis matches".
          </p>
        )}

        <button
          style={yaLeGusta ? styles.botonQuitar : styles.botonInteres}
          onClick={marcarInteres}
          disabled={procesando}
        >
          {procesando
            ? "Un momento…"
            : yaLeGusta
            ? "Quitar me interesa"
            : "Me interesa"}
        </button>

        {/* Denuncia */}
        {denunciaEnviada ? (
          <p style={styles.denunciaOk}>
            Gracias. Hemos recibido tu denuncia y la revisaremos.
          </p>
        ) : mostrarDenuncia ? (
          <div style={styles.denunciaCaja}>
            <p style={styles.denunciaTitulo}>Denunciar este perfil</p>
            <textarea
              style={styles.denunciaTexto}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Cuéntanos qué ha pasado."
            />
            <label style={styles.denunciaLabel}>
              Captura (opcional)
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCaptura(e.target.files?.[0] ?? null)}
                style={{ display: "block", marginTop: "6px" }}
              />
            </label>
            <div style={styles.denunciaBotones}>
              <button
                style={styles.denunciaEnviar}
                onClick={enviarDenuncia}
                disabled={enviandoDenuncia || !motivo.trim()}
              >
                {enviandoDenuncia ? "Enviando…" : "Enviar denuncia"}
              </button>
              <button
                style={styles.denunciaCancelar}
                onClick={() => setMostrarDenuncia(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            style={styles.denunciarLink}
            onClick={() => setMostrarDenuncia(true)}
          >
            Denunciar perfil
          </button>
        )}
      </div>
    <NavBar />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#F4ECDD",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "32px 20px 90px",
  },
  card: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  volver: {
    background: "transparent",
    border: "none",
    color: "#B85C3C",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "16px",
    display: "block",
  },
  foto: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #B85C3C",
    margin: "0 auto 16px",
    display: "block",
  },
  fotoVacia: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    background: "#F3E0D5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8A7C6B",
    margin: "0 auto 16px",
  },
  nombre: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "26px",
    marginBottom: "4px",
  },
  ubicacion: { color: "#5C5042", fontSize: "15px", marginBottom: "10px" },
  etiqueta: {
    display: "inline-block",
    background: "#F3E0D5",
    color: "#9A4A2E",
    fontSize: "13px",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "20px",
  },
  datos: { textAlign: "left", margin: "0 0 24px" },
  dato: { color: "#5C5042", fontSize: "15px", lineHeight: 1.6, marginBottom: "8px" },
  sobreMi: {
    color: "#6E6051",
    fontSize: "15px",
    lineHeight: 1.6,
    fontStyle: "italic",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #EADDC9",
  },
  matchAviso: {
    background: "#7E8A5A",
    color: "#FBF4E9",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "15px",
    marginBottom: "16px",
  },
  botonInteres: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
  },
  botonQuitar: {
    width: "100%",
    padding: "15px",
    border: "1px solid #B85C3C",
    borderRadius: "10px",
    background: "transparent",
    color: "#B85C3C",
    fontSize: "17px",
    fontWeight: 600,
    cursor: "pointer",
  },
  cargando: { color: "#8A7C6B", fontSize: "16px", textAlign: "center" },
  denunciarLink: {
    background: "transparent",
    border: "none",
    color: "#8A7C6B",
    fontSize: "13px",
    cursor: "pointer",
    marginTop: "18px",
    textDecoration: "underline",
  },
  denunciaCaja: {
    marginTop: "20px",
    padding: "16px",
    background: "#FFFCF6",
    border: "1px solid #E0D2BC",
    borderRadius: "10px",
    textAlign: "left",
  },
  denunciaTitulo: {
    color: "#9A4A2E",
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "10px",
  },
  denunciaTexto: {
    width: "100%",
    minHeight: "70px",
    padding: "10px",
    border: "1px solid #E0D2BC",
    borderRadius: "8px",
    background: "#FBF4E9",
    color: "#33291F",
    fontSize: "14px",
    resize: "vertical",
  },
  denunciaLabel: {
    display: "block",
    color: "#5C5042",
    fontSize: "13px",
    marginTop: "12px",
  },
  denunciaBotones: { display: "flex", gap: "10px", marginTop: "14px" },
  denunciaEnviar: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#9A4A2E",
    color: "#FBF4E9",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  denunciaCancelar: {
    padding: "10px 18px",
    border: "1px solid #D8BFA9",
    borderRadius: "8px",
    background: "transparent",
    color: "#8A7C6B",
    fontSize: "14px",
    cursor: "pointer",
  },
  denunciaOk: {
    marginTop: "18px",
    color: "#7E8A5A",
    fontSize: "14px",
    fontStyle: "italic",
  },
};
