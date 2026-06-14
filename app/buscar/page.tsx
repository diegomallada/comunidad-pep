"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/NavBar";

const PROVINCIAS = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
  "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz",
  "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "A Coruña",
  "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva",
  "Huesca", "Jaén", "León", "Lleida", "Lugo", "Madrid", "Málaga",
  "Murcia", "Navarra", "Ourense", "Palencia", "Las Palmas", "Pontevedra",
  "La Rioja", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla",
  "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid",
  "Bizkaia", "Zamora", "Zaragoza", "Ceuta", "Melilla",
];

const FRECUENCIAS = [
  "Diaria",
  "Varias veces por semana",
  "Semanal (domingo)",
  "Ocasional",
];

const PAISES = [
  "España", "México", "Argentina", "Colombia", "Chile", "Perú",
  "Venezuela", "Ecuador", "Guatemala", "Bolivia", "República Dominicana",
  "Honduras", "Paraguay", "El Salvador", "Nicaragua", "Costa Rica",
  "Panamá", "Uruguay", "Puerto Rico", "Cuba", "Guinea Ecuatorial",
  "Estados Unidos", "Otro",
];

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

export default function BuscarPage() {
  const supabase = createClient();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [miId, setMiId] = useState<string | null>(null);
  const [miSexo, setMiSexo] = useState<string | null>(null);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);

  // Filtros
  const [pais, setPais] = useState("");
  const [provincia, setProvincia] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");

  async function cargarPerfiles(sexoOpuesto?: string) {
    setCargando(true);
    const objetivo = sexoOpuesto ?? (miSexo === "Hombre" ? "Mujer" : "Hombre");

    let query = supabase
      .from("profiles")
      .select("id, nombre, edad, provincia, pais, formacion, institucion, frecuencia_practica, sobre_mi, foto_url, sexo")
      .eq("cuestionario_completado", true)
      .eq("visible", true)
      .eq("sexo", objetivo);

    if (pais) query = query.eq("pais", pais);
    if (provincia) query = query.eq("provincia", provincia);
    if (frecuencia) query = query.eq("frecuencia_practica", frecuencia);
    if (edadMin) query = query.gte("edad", parseInt(edadMin, 10));
    if (edadMax) query = query.lte("edad", parseInt(edadMax, 10));

    const { data } = await query.order("created_at", { ascending: false });
    // Quitamos nuestro propio perfil del listado
    setPerfiles((data ?? []).filter((p) => p.id !== miId));
    setCargando(false);
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
      setMiId(user.id);

      // Leemos mi sexo para mostrar solo el opuesto
      const { data } = await supabase
        .from("profiles")
        .select("sexo")
        .eq("id", user.id)
        .single();
      const mio = data?.sexo ?? null;
      setMiSexo(mio);
      const opuesto = mio === "Hombre" ? "Mujer" : "Hombre";
      cargarPerfiles(opuesto);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limpiarFiltros() {
    setPais("");
    setProvincia("");
    setFrecuencia("");
    setEdadMin("");
    setEdadMax("");
  }

  return (
    <main style={styles.main}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <h1 style={styles.titulo}>Buscar</h1>
          <p style={styles.subtitulo}>Comunidad Pep Borrell</p>
        </header>

        {/* Filtros */}
        <div style={styles.filtros}>
          <div style={styles.filtroCampo}>
            <label style={styles.label}>País</label>
            <select
              style={styles.input}
              value={pais}
              onChange={(e) => {
                setPais(e.target.value);
                setProvincia("");
              }}
            >
              <option value="">Todos</option>
              {PAISES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div style={styles.filtroCampo}>
            <label style={styles.label}>
              {pais === "" || pais === "España" ? "Provincia" : "Provincia / Región"}
            </label>
            {pais === "" || pais === "España" ? (
              <select style={styles.input} value={provincia} onChange={(e) => setProvincia(e.target.value)}>
                <option value="">Todas</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            ) : (
              <input
                style={styles.input}
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
                placeholder="Escribe la región"
              />
            )}
          </div>
          <div style={styles.filtroCampo}>
            <label style={styles.label}>Práctica</label>
            <select style={styles.input} value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}>
              <option value="">Cualquiera</option>
              {FRECUENCIAS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div style={styles.filtroCampoCorto}>
            <label style={styles.label}>Edad mín.</label>
            <input style={styles.input} type="number" value={edadMin} onChange={(e) => setEdadMin(e.target.value)} placeholder="—" />
          </div>
          <div style={styles.filtroCampoCorto}>
            <label style={styles.label}>Edad máx.</label>
            <input style={styles.input} type="number" value={edadMax} onChange={(e) => setEdadMax(e.target.value)} placeholder="—" />
          </div>
        </div>

        <div style={styles.botonera}>
          <button style={styles.boton} onClick={cargarPerfiles}>Buscar</button>
          <button style={styles.botonSec} onClick={limpiarFiltros}>Limpiar</button>
        </div>

        {/* Resultados */}
        {cargando ? (
          <p style={styles.vacio}>Cargando…</p>
        ) : perfiles.length === 0 ? (
          <p style={styles.vacio}>
            No hay perfiles que coincidan. Prueba a quitar filtros.
          </p>
        ) : (
          <div style={styles.grid}>
            {perfiles.map((p) => (
              <div
                key={p.id}
                style={{ ...styles.tarjeta, cursor: "pointer" }}
                onClick={() => router.push(`/perfil/${p.id}`)}
              >
                {p.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.foto_url} alt={p.nombre} style={styles.foto} />
                ) : (
                  <div style={styles.fotoVacia}>Sin foto</div>
                )}
                <h3 style={styles.nombre}>
                  {p.nombre}
                  {p.edad ? `, ${p.edad}` : ""}
                </h3>
                {(p.provincia || p.pais) && (
                  <p style={styles.dato}>
                    {[p.provincia, p.pais].filter(Boolean).join(", ")}
                  </p>
                )}
                {p.frecuencia_practica && (
                  <p style={styles.etiqueta}>{p.frecuencia_practica}</p>
                )}
                {p.sobre_mi && <p style={styles.sobreMi}>{p.sobre_mi}</p>}
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
  main: {
    minHeight: "100vh",
    background: "#F4ECDD",
    padding: "32px 20px 90px",
  },
  wrap: { maxWidth: "900px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "28px" },
  titulo: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "32px",
  },
  subtitulo: {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    color: "#9A4A2E",
  },
  filtros: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "12px",
    padding: "16px",
  },
  filtroCampo: { flex: "1 1 180px" },
  filtroCampoCorto: { flex: "1 1 90px" },
  label: { display: "block", color: "#5C5042", fontSize: "13px", marginBottom: "4px" },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #E0D2BC",
    borderRadius: "8px",
    background: "#FFFCF6",
    color: "#33291F",
    fontSize: "14px",
  },
  botonera: { display: "flex", gap: "10px", margin: "16px 0 28px" },
  boton: {
    padding: "12px 28px",
    border: "none",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  botonSec: {
    padding: "12px 20px",
    border: "1px solid #D8BFA9",
    borderRadius: "8px",
    background: "transparent",
    color: "#8A7C6B",
    fontSize: "15px",
    cursor: "pointer",
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
  dato: { color: "#5C5042", fontSize: "14px", marginBottom: "8px" },
  etiqueta: {
    display: "inline-block",
    background: "#F3E0D5",
    color: "#9A4A2E",
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "10px",
  },
  sobreMi: {
    color: "#6E6051",
    fontSize: "13px",
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  vacio: {
    textAlign: "center",
    color: "#8A7C6B",
    fontSize: "16px",
    padding: "40px 0",
  },
};
