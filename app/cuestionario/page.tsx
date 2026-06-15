"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  "España",
  "México",
  "Argentina",
  "Colombia",
  "Chile",
  "Perú",
  "Venezuela",
  "Ecuador",
  "Guatemala",
  "Bolivia",
  "República Dominicana",
  "Honduras",
  "Paraguay",
  "El Salvador",
  "Nicaragua",
  "Costa Rica",
  "Panamá",
  "Uruguay",
  "Puerto Rico",
  "Cuba",
  "Guinea Ecuatorial",
  "Estados Unidos",
  "Otro",
];

function calcularEdad(fechaNac: string): number | null {
  if (!fechaNac) return null;
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function CuestionarioPage() {
  const supabase = createClient();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [pais, setPais] = useState("España");
  const [provincia, setProvincia] = useState("");
  const [formacion, setFormacion] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [frecuencia, setFrecuencia] = useState("");
  const [sobreMi, setSobreMi] = useState("");
  const [sexo, setSexo] = useState("");
  const [telegram, setTelegram] = useState("");

  // Foto
  const [fotoUrl, setFotoUrl] = useState<string>("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setNombre(data.nombre ?? "");
        setFechaNac(data.fecha_nacimiento ?? "");
        setPais(data.pais ?? "España");
        setProvincia(data.provincia ?? "");
        setFormacion(data.formacion ?? "");
        setInstitucion(data.institucion ?? "");
        setFrecuencia(data.frecuencia_practica ?? "");
        setSobreMi(data.sobre_mi ?? "");
        setSexo(data.sexo ?? "");
        setTelegram(data.telegram ?? "");
        setFotoUrl(data.foto_url ?? "");
      }
      setCargando(false);
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redimensiona y comprime la imagen en el navegador antes de subir.
  // Cualquier foto (aunque sea de 8 MB del móvil) sale a ~200-400 KB.
  function redimensionar(file: File, maxLado = 1000): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > height && width > maxLado) {
          height = Math.round((height * maxLado) / width);
          width = maxLado;
        } else if (height > maxLado) {
          width = Math.round((width * maxLado) / height);
          height = maxLado;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo procesar la imagen"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Error al comprimir"))),
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen"));
      };
      img.src = url;
    });
  }

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }

    setError(null);
    setSubiendoFoto(true);

    try {
      const blob = await redimensionar(file);
      const ruta = `${userId}/perfil.jpg`;

      const { error: upErr } = await supabase.storage
        .from("fotos")
        .upload(ruta, blob, { upsert: true, contentType: "image/jpeg" });

      if (upErr) {
        setError("No se pudo subir la foto: " + upErr.message);
        setSubiendoFoto(false);
        return;
      }

      const { data } = supabase.storage.from("fotos").getPublicUrl(ruta);
      setFotoUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (err) {
      setError("No se pudo procesar la imagen. Prueba con otra.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function guardar() {
    setError(null);

    const edadCalc = calcularEdad(fechaNac);

    if (!nombre || !provincia || !frecuencia || !sexo || !telegram.trim() || !sobreMi.trim()) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (!fotoUrl) {
      setError("Añade una foto de perfil para continuar (obligatorio).");
      return;
    }

    setGuardando(true);
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        nombre,
        edad: edadCalc,
        pais,
        provincia,
        formacion,
        institucion,
        frecuencia_practica: frecuencia,
        sobre_mi: sobreMi,
        sexo,
        telegram: telegram.trim().replace(/^@/, ""),
        foto_url: fotoUrl,
        cuestionario_completado: true,
      })
      .eq("id", userId);

    setGuardando(false);

    if (error) {
      setError("No se pudo guardar. Inténtalo de nuevo.");
      return;
    }
    router.push("/buscar");
  }

  async function eliminarCuenta() {
    const ok = window.confirm(
      "¿Seguro que quieres eliminar tu cuenta? Se borrarán tu perfil, tu foto y todos tus datos de forma permanente. Esta acción no se puede deshacer."
    );
    if (!ok || !userId) return;

    // Borrar foto del almacenamiento
    try {
      await supabase.storage.from("fotos").remove([`${userId}/perfil.jpg`]);
    } catch {}

    // Borrar likes (dados y recibidos), denuncias propias y el perfil
    await supabase.from("likes").delete().or(`de_id.eq.${userId},a_id.eq.${userId}`);
    await supabase.from("denuncias").delete().eq("denunciante_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);

    // Cerrar sesión y volver a la portada
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (cargando) {
    return (
      <main style={styles.main}>
        <p style={styles.cargando}>Cargando…</p>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Tu perfil</h1>
        <p style={styles.subtitulo}>
          Cuéntanos sobre ti. Sé auténtico: esto ayuda a encontrar a la persona
          adecuada.
        </p>

        {/* Foto */}
        <div style={styles.fotoZona}>
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt="Tu foto" style={styles.fotoPreview} />
          ) : (
            <div style={styles.fotoPlaceholder}>Sin foto</div>
          )}
          <label style={styles.botonFoto}>
            {subiendoFoto ? "Subiendo…" : fotoUrl ? "Cambiar foto" : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              onChange={subirFoto}
              style={{ display: "none" }}
            />
          </label>
          <p style={styles.consejoFoto}>
            Una foto natural y reciente. Sé auténtico: evita filtros o retoques.
          </p>
        </div>

        <label style={styles.label}>Nombre (obligatorio)</label>
        <input style={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label style={styles.label}>Soy (obligatorio)</label>
        <select style={styles.input} value={sexo} onChange={(e) => setSexo(e.target.value)}>
          <option value="">Elige…</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
        </select>

        <label style={styles.label}>Edad</label>
        <input
          style={{ ...styles.input, background: "#F4ECDD", color: "#8A7C6B" }}
          value={
            calcularEdad(fechaNac) !== null
              ? `${calcularEdad(fechaNac)} años`
              : "Se calcula desde tu fecha de nacimiento"
          }
          readOnly
        />

        <label style={styles.label}>País (obligatorio)</label>
        <select
          style={styles.input}
          value={pais}
          onChange={(e) => {
            setPais(e.target.value);
            setProvincia(""); // al cambiar de país, reiniciamos la provincia
          }}
        >
          {PAISES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label style={styles.label}>
          {pais === "España" ? "Provincia (obligatorio)" : "Provincia / Región (obligatorio)"}
        </label>
        {pais === "España" ? (
          <select style={styles.input} value={provincia} onChange={(e) => setProvincia(e.target.value)}>
            <option value="">Elige…</option>
            {PROVINCIAS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        ) : (
          <input
            style={styles.input}
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            placeholder="Escribe tu provincia, estado o región"
          />
        )}

        <label style={styles.label}>Frecuencia de práctica (misa) (obligatorio)</label>
        <select style={styles.input} value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}>
          <option value="">Elige…</option>
          {FRECUENCIAS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <label style={styles.label}>Profesión (opcional)</label>
        <input
          style={styles.input}
          value={formacion}
          onChange={(e) => setFormacion(e.target.value)}
          placeholder="Tu profesión u ocupación"
        />

        <label style={styles.label}>¿Perteneces a alguna institución o movimiento? (opcional)</label>
        <input
          style={styles.input}
          value={institucion}
          onChange={(e) => setInstitucion(e.target.value)}
          placeholder="Parroquia, movimiento…"
        />

        <label style={styles.label}>Sobre mí (obligatorio)</label>
        <textarea
          style={{ ...styles.input, minHeight: "100px", resize: "vertical" }}
          value={sobreMi}
          onChange={(e) => setSobreMi(e.target.value)}
          placeholder="Unas líneas sobre ti, tu fe y lo que buscas."
        />

        <label style={styles.label}>Usuario de Telegram (obligatorio)</label>
        <input
          style={styles.input}
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="@tuusuario"
        />
        <p style={styles.notaPrivacidad}>
          Solo se mostrará a las personas con las que tengáis un match mutuo.
          Nunca aparece en tu perfil público ni en las búsquedas.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.boton} onClick={guardar} disabled={guardando || subiendoFoto}>
          {guardando ? "Guardando…" : "Guardar y continuar"}
        </button>

        <div style={styles.zonaPeligro}>
          <button style={styles.botonEliminar} onClick={eliminarCuenta}>
            Eliminar mi cuenta
          </button>
          <p style={styles.notaEliminar}>
            Borra tu perfil y todos tus datos de forma permanente.
          </p>
        </div>
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
    padding: "24px",
  },
  card: {
    background: "#FBF4E9",
    border: "1px solid #E0D2BC",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  titulo: {
    fontFamily: "Georgia, serif",
    color: "#33291F",
    fontSize: "28px",
    marginBottom: "6px",
  },
  subtitulo: {
    color: "#5C5042",
    fontSize: "15px",
    lineHeight: 1.5,
    marginBottom: "8px",
  },
  fotoZona: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "20px 0",
    borderBottom: "1px solid #EADDC9",
    marginBottom: "8px",
  },
  fotoPreview: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #B85C3C",
  },
  fotoPlaceholder: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#F3E0D5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8A7C6B",
    fontSize: "14px",
    border: "1px dashed #D8BFA9",
  },
  botonFoto: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "#B85C3C",
    color: "#FBF4E9",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  consejoFoto: {
    color: "#8A7C6B",
    fontSize: "13px",
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: "260px",
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
  notaPrivacidad: {
    color: "#8A7C6B",
    fontSize: "13px",
    fontStyle: "italic",
    marginTop: "6px",
    lineHeight: 1.5,
  },
  zonaPeligro: {
    marginTop: "32px",
    paddingTop: "20px",
    borderTop: "1px solid #EADDC9",
    textAlign: "center",
  },
  botonEliminar: {
    background: "transparent",
    border: "1px solid #9A4A2E",
    color: "#9A4A2E",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  notaEliminar: {
    color: "#8A7C6B",
    fontSize: "12px",
    marginTop: "8px",
  },
  cargando: { color: "#8A7C6B", fontSize: "16px" },
};
